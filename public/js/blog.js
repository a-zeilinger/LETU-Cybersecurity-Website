// Blog JavaScript for Cybersecurity Club Website

document.addEventListener('DOMContentLoaded', function() {
    const blogGrid = document.getElementById('blogGrid');
    
    if (!blogGrid) return;
    
    // Load blog posts from API
    loadBlogPosts();
    
    async function loadBlogPosts() {
        try {
            const response = await fetch('/api/blog');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blogPosts = await response.json();
            displayBlogPosts(blogPosts);
            
        } catch (error) {
            console.error('Error loading blog posts:', error);
            displayError('Failed to load blog posts. Please try again later.');
        }
    }
    
    function displayBlogPosts(blogPosts) {
        if (blogPosts.length === 0) {
            blogGrid.innerHTML = `
                <div class="no-posts">
                    <h3>No Blog Posts Available</h3>
                    <p>Check back soon for the latest cybersecurity insights and news.</p>
                </div>
            `;
            return;
        }
        
        const postsHTML = blogPosts.map(post => createBlogCard(post)).join('');
        blogGrid.innerHTML = postsHTML;
        
        // Add click handlers for blog cards
        addBlogCardHandlers();
    }
    
    function createBlogCard(post) {
        const formattedDate = window.formatDate ? window.formatDate(post.date) : post.date;
        
        return `
            <div class="blog-card" data-post-id="${post.id}">
                <div class="blog-image">
                    ${getBlogIcon(post.title)}
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="blog-author">By ${escapeHtml(post.author)}</span>
                        <span class="blog-read-time">${escapeHtml(post.readTime)}</span>
                    </div>
                    <h3 class="blog-title">${escapeHtml(post.title)}</h3>
                    <p class="blog-excerpt">${escapeHtml(post.excerpt)}</p>
                    <div class="blog-date">${formattedDate}</div>
                    <button class="btn btn-secondary blog-read-btn">Read More</button>
                </div>
            </div>
        `;
    }
    
    function getBlogIcon(title) {
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes('ransomware')) {
            return '🔒';
        } else if (lowerTitle.includes('zero-day') || lowerTitle.includes('vulnerability')) {
            return '⚠️';
        } else if (lowerTitle.includes('social engineering')) {
            return '🎭';
        } else if (lowerTitle.includes('phishing')) {
            return '🎣';
        } else if (lowerTitle.includes('malware')) {
            return '🦠';
        } else if (lowerTitle.includes('network') || lowerTitle.includes('firewall')) {
            return '🌐';
        } else {
            return '📰';
        }
    }
    
    function addBlogCardHandlers() {
        document.querySelectorAll('.blog-read-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const blogCard = this.closest('.blog-card');
                const postId = blogCard.dataset.postId;
                
                // Show blog post details modal or navigate to detailed view
                showBlogPostDetails(postId);
            });
        });
        
        // Add hover effects
        document.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    function showBlogPostDetails(postId) {
        // For now, show a simple alert. In a real application, this would open a modal
        // or navigate to a detailed blog post page
        alert(`Blog post details for post ID: ${postId}\n\nThis would typically open a detailed view or modal with the full blog post content.`);
    }
    
    function displayError(message) {
        blogGrid.innerHTML = `
            <div class="error-message">
                <div class="error-icon">❌</div>
                <h3>Error Loading Blog Posts</h3>
                <p>${escapeHtml(message)}</p>
                <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
            </div>
        `;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Add CSS for error and no-posts states
    const style = document.createElement('style');
    style.textContent = `
        .no-posts, .error-message {
            text-align: center;
            padding: 3rem;
            background-color: var(--secondary);
            border-radius: var(--border-radius-lg);
            border: 1px solid var(--border);
        }
        
        .no-posts h3, .error-message h3 {
            color: var(--text);
            margin-bottom: 1rem;
        }
        
        .no-posts p, .error-message p {
            color: var(--text-muted);
            margin-bottom: 1.5rem;
        }
        
        .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .blog-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .blog-read-btn {
            margin-top: 1rem;
        }
        
        .blog-date {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
    `;
    document.head.appendChild(style);
}); 