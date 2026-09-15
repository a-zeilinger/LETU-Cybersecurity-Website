#!/usr/bin/env bash
#
# Cybersecurity Club Packet Analysis Lab
#
# Creates a completely isolated two-host network inside Linux using:
#   - a Linux network namespace
#   - a virtual Ethernet (veth) pair
#   - a simple Python HTTP server
#
# No physical switch, router, Internet connection, or campus network is required.
#
# Usage:
#   sudo ./packet-analysis-lab.sh setup
#   sudo ./packet-analysis-lab.sh status
#   sudo ./packet-analysis-lab.sh cleanup
#
# Wireshark capture interface:
#   veth-client
#

set -euo pipefail

NAMESPACE="packet-server"
CLIENT_IF="veth-client"
SERVER_IF="veth-server"

CLIENT_IP="10.10.10.20"
SERVER_IP="10.10.10.10"
PREFIX="24"

HTTP_PORT="8000"

LAB_DIR="/tmp/cyberclub-packet-lab"
PID_FILE="/tmp/cyberclub-packet-lab-http.pid"
LOG_FILE="/tmp/cyberclub-packet-lab-http.log"

# ---------- Formatting ----------

if [[ -t 1 ]]; then
    BOLD="\033[1m"
    GREEN="\033[32m"
    YELLOW="\033[33m"
    RED="\033[31m"
    RESET="\033[0m"
else
    BOLD=""
    GREEN=""
    YELLOW=""
    RED=""
    RESET=""
fi

info() {
    echo -e "${GREEN}[+]${RESET} $*"
}

warn() {
    echo -e "${YELLOW}[!]${RESET} $*"
}

error() {
    echo -e "${RED}[-]${RESET} $*" >&2
}

# ---------- Requirements ----------

require_root() {
    if [[ "${EUID}" -ne 0 ]]; then
        error "This script must be run with sudo."
        echo
        echo "Example:"
        echo "  sudo $0 setup"
        exit 1
    fi
}

require_commands() {
    local missing=0

    for cmd in ip python3; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            error "Required command not found: $cmd"
            missing=1
        fi
    done

    if [[ "$missing" -ne 0 ]]; then
        echo
        echo "On Kali/Debian, install missing packages with:"
        echo "  sudo apt update"
        echo "  sudo apt install iproute2 python3"
        exit 1
    fi
}

# ---------- Helpers ----------

namespace_exists() {
    ip netns list 2>/dev/null | awk '{print $1}' | grep -qx "$NAMESPACE"
}

client_interface_exists() {
    ip link show "$CLIENT_IF" >/dev/null 2>&1
}

http_server_running() {
    if [[ ! -f "$PID_FILE" ]]; then
        return 1
    fi

    local pid
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"

    [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1
}

stop_http_server() {
    if [[ -f "$PID_FILE" ]]; then
        local pid
        pid="$(cat "$PID_FILE" 2>/dev/null || true)"

        if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
            info "Stopping lab HTTP server..."
            kill "$pid" >/dev/null 2>&1 || true

            # Give the process a moment to exit.
            for _ in {1..20}; do
                if ! kill -0 "$pid" >/dev/null 2>&1; then
                    break
                fi
                sleep 0.1
            done

            if kill -0 "$pid" >/dev/null 2>&1; then
                warn "HTTP server did not exit normally; terminating it."
                kill -9 "$pid" >/dev/null 2>&1 || true
            fi
        fi

        rm -f "$PID_FILE"
    fi
}

cleanup_lab() {
    stop_http_server

    if namespace_exists; then
        info "Removing network namespace: $NAMESPACE"
        ip netns del "$NAMESPACE" >/dev/null 2>&1 || true
    fi

    # Normally deleting the namespace also removes its veth peer.
    # This handles partial/failed setups safely.
    if client_interface_exists; then
        info "Removing virtual Ethernet interface: $CLIENT_IF"
        ip link del "$CLIENT_IF" >/dev/null 2>&1 || true
    fi

    rm -rf "$LAB_DIR"
    rm -f "$PID_FILE"

    info "Packet analysis lab cleaned up."
}

# ---------- Setup ----------

setup_lab() {
    require_commands

    echo
    echo -e "${BOLD}Cybersecurity Club Packet Analysis Lab${RESET}"
    echo "----------------------------------------"
    echo

    # Start clean if a previous run exists.
    if namespace_exists || client_interface_exists || [[ -f "$PID_FILE" ]]; then
        warn "An existing or partial lab was found."
        warn "Cleaning it up before creating a fresh lab."
        cleanup_lab
        echo
    fi

    info "Creating isolated server namespace..."
    ip netns add "$NAMESPACE"

    info "Creating virtual Ethernet pair..."
    ip link add "$CLIENT_IF" type veth peer name "$SERVER_IF"

    info "Moving server-side interface into the namespace..."
    ip link set "$SERVER_IF" netns "$NAMESPACE"

    info "Configuring client address ${CLIENT_IP}/${PREFIX}..."
    ip addr add "${CLIENT_IP}/${PREFIX}" dev "$CLIENT_IF"
    ip link set "$CLIENT_IF" up

    info "Configuring server address ${SERVER_IP}/${PREFIX}..."
    ip netns exec "$NAMESPACE" \
        ip addr add "${SERVER_IP}/${PREFIX}" dev "$SERVER_IF"

    ip netns exec "$NAMESPACE" \
        ip link set "$SERVER_IF" up

    ip netns exec "$NAMESPACE" \
        ip link set lo up

    info "Creating HTTP lab content..."
    mkdir -p "$LAB_DIR"

    cat > "${LAB_DIR}/index.html" <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Cyber Club Packet Analysis Lab</title>
</head>
<body>
  <h1>Cyber Club Packet Analysis Lab</h1>
  <p>If you can read this page, your isolated HTTP lab is working.</p>
  <p>Try analyzing this request in Wireshark.</p>
</body>
</html>
EOF

    cat > "${LAB_DIR}/flag.txt" <<'EOF'
FLAG{PACKETS_TELL_A_STORY}
EOF

    cat > "${LAB_DIR}/notes.txt" <<'EOF'
Packet Analysis Questions

1. Which host initiated the TCP connection?
2. What destination port was used?
3. Can you find the TCP three-way handshake?
4. Which HTTP resource was requested?
5. What did the server return?
EOF

    info "Starting isolated HTTP server on ${SERVER_IP}:${HTTP_PORT}..."

    # Run the web server inside the server namespace.
    ip netns exec "$NAMESPACE" \
        python3 -m http.server "$HTTP_PORT" \
        --bind "$SERVER_IP" \
        --directory "$LAB_DIR" \
        >"$LOG_FILE" 2>&1 &

    HTTP_PID=$!
    echo "$HTTP_PID" > "$PID_FILE"

    # Give the server a brief moment to initialize.
    sleep 0.5

    if ! http_server_running; then
        error "The HTTP server failed to start."
        if [[ -f "$LOG_FILE" ]]; then
            echo
            echo "Server log:"
            cat "$LOG_FILE"
        fi
        cleanup_lab
        exit 1
    fi

    info "Testing the isolated connection..."

    if ping -I "$CLIENT_IF" -c 1 -W 2 "$SERVER_IP" >/dev/null 2>&1; then
        info "ICMP test succeeded."
    else
        warn "Ping test did not succeed."
        warn "The lab was still created; inspect the configuration with:"
        echo "  sudo $0 status"
    fi

    echo
    echo -e "${BOLD}Lab ready.${RESET}"
    echo
    echo "Topology:"
    echo
    echo "  Kali / Client                       Isolated Server Namespace"
    echo "  ${CLIENT_IP}                         ${SERVER_IP}"
    echo "  ${CLIENT_IF}  <==================>  ${SERVER_IF}"
    echo
    echo "Wireshark capture interface:"
    echo "  ${CLIENT_IF}"
    echo
    echo "Useful Wireshark display filters:"
    echo "  arp"
    echo "  icmp"
    echo "  tcp"
    echo "  http"
    echo "  ip.addr == ${SERVER_IP}"
    echo "  tcp.port == ${HTTP_PORT}"
    echo "  tcp.flags.syn == 1 && tcp.flags.ack == 0"
    echo
    echo "Generate traffic:"
    echo "  ping -c 4 ${SERVER_IP}"
    echo "  curl http://${SERVER_IP}:${HTTP_PORT}/"
    echo "  curl http://${SERVER_IP}:${HTTP_PORT}/flag.txt"
    echo
    echo "For a clean ARP demonstration:"
    echo "  sudo ip neigh flush dev ${CLIENT_IF}"
    echo "  ping -c 1 ${SERVER_IP}"
    echo
    echo "Optional Nmap demonstration:"
    echo "  nmap ${SERVER_IP}"
    echo
    echo "When finished:"
    echo "  sudo $0 cleanup"
    echo
    echo -e "${YELLOW}This lab network has no default gateway or route to the Internet.${RESET}"
    echo "Traffic on ${CLIENT_IF} stays within this local virtual link."
    echo
}

# ---------- Status ----------

show_status() {
    require_commands

    echo
    echo -e "${BOLD}Cybersecurity Club Packet Analysis Lab Status${RESET}"
    echo "---------------------------------------------"

    if namespace_exists; then
        echo -e "Namespace:        ${GREEN}UP${RESET} ($NAMESPACE)"
    else
        echo -e "Namespace:        ${RED}DOWN${RESET}"
    fi

    if client_interface_exists; then
        echo -e "Client interface: ${GREEN}UP${RESET} ($CLIENT_IF)"
        ip -brief addr show "$CLIENT_IF" 2>/dev/null || true
    else
        echo -e "Client interface: ${RED}DOWN${RESET}"
    fi

    if namespace_exists; then
        echo
        echo "Server namespace interfaces:"
        ip netns exec "$NAMESPACE" ip -brief addr 2>/dev/null || true
    fi

    echo
    if http_server_running; then
        echo -e "HTTP server:      ${GREEN}RUNNING${RESET}"
        echo "URL:              http://${SERVER_IP}:${HTTP_PORT}/"
    else
        echo -e "HTTP server:      ${RED}NOT RUNNING${RESET}"
    fi

    echo
}

# ---------- Main ----------

require_root

ACTION="${1:-setup}"

case "$ACTION" in
    setup|start)
        setup_lab
        ;;
    cleanup|stop|remove)
        cleanup_lab
        ;;
    status)
        show_status
        ;;
    help|-h|--help)
        cat <<EOF

Cybersecurity Club Packet Analysis Lab

Usage:
  sudo $0 setup
  sudo $0 status
  sudo $0 cleanup

Commands:
  setup     Create the isolated packet-analysis network and HTTP server.
  status    Show the current lab state.
  cleanup   Remove the namespace, virtual interfaces, and lab files.

Wireshark interface:
  $CLIENT_IF

EOF
        ;;
    *)
        error "Unknown command: $ACTION"
        echo "Run: sudo $0 help"
        exit 1
        ;;
esac

