# Cybersecurity Club Packet Analysis Lab

This lab creates a small, isolated two-host network entirely inside a Linux/Kali system.

It is intended for learning packet analysis with Wireshark without requiring a physical switch, router, Internet connection, or campus network access.

## Topology

```text
Kali / Client                       Isolated Server
10.10.10.20                         10.10.10.10
veth-client  <==================>   veth-server
```

The server runs inside a Linux network namespace. The two systems are connected by a virtual Ethernet pair.

There is no default gateway configured for the lab network.

## Requirements

- Kali Linux or another Linux distribution
- `iproute2`
- Python 3
- Wireshark
- Optional: Nmap

## Run the lab

Make the script executable:

```bash
chmod +x packet-analysis-lab.sh
```

Start the lab:

```bash
sudo ./packet-analysis-lab.sh setup
```

Open Wireshark and capture on:

```text
veth-client
```

## Generate traffic

ARP + ICMP:

```bash
sudo ip neigh flush dev veth-client
ping -c 4 10.10.10.10
```

HTTP:

```bash
curl http://10.10.10.10:8000/
curl http://10.10.10.10:8000/flag.txt
```

Optional Nmap exercise:

```bash
nmap 10.10.10.10
```

## Useful Wireshark display filters

```text
arp
icmp
tcp
http
ip.addr == 10.10.10.10
tcp.port == 8000
tcp.flags.syn == 1 && tcp.flags.ack == 0
```

## Check status

```bash
sudo ./packet-analysis-lab.sh status
```

## Clean up

```bash
sudo ./packet-analysis-lab.sh cleanup
```

This removes the namespace, virtual Ethernet interfaces, and temporary lab files.

