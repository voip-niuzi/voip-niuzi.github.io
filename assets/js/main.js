/**
 * 牛子通信 - 主JavaScript文件
 * 实现网站交互功能和SEO优化
 */

(function() {
    'use strict';
    
    // 工具函数
    const utils = {
        // 防抖函数
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // 节流函数
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // 检查元素是否在视口中
        isInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },
        
        // 平滑滚动到元素
        smoothScrollTo: function(element, offset = 0) {
            const targetPosition = element.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    };
    
    // 移动端菜单控制
    class MobileMenu {
        constructor() {
            this.menuBtn = document.querySelector('.mobile-menu-btn');
            this.nav = document.querySelector('.main-nav');
            this.navLinks = document.querySelectorAll('.nav-list a');
            this.isOpen = false;
            
            this.init();
        }
        
        init() {
            if (!this.menuBtn || !this.nav) return;
            
            this.menuBtn.addEventListener('click', () => this.toggle());
            
            // 点击导航链接时关闭菜单
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => this.close());
            });
            
            // 点击外部区域关闭菜单
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.nav.contains(e.target) && !this.menuBtn.contains(e.target)) {
                    this.close();
                }
            });
            
            // ESC键关闭菜单
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }
        
        toggle() {
            this.isOpen ? this.close() : this.open();
        }
        
        open() {
            this.nav.classList.add('active');
            this.menuBtn.classList.add('active');
            this.menuBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            this.isOpen = true;
        }
        
        close() {
            this.nav.classList.remove('active');
            this.menuBtn.classList.remove('active');
            this.menuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            this.isOpen = false;
        }
    }
    
    // 标签页功能
    class TabSystem {
        constructor() {
            this.tabButtons = document.querySelectorAll('.tab-button');
            this.tabPanels = document.querySelectorAll('.tab-panel');
            
            this.init();
        }
        
        init() {
            if (!this.tabButtons.length || !this.tabPanels.length) return;
            
            this.tabButtons.forEach((button, index) => {
                button.addEventListener('click', () => this.switchTab(index));
                
                // 键盘导航支持
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        const direction = e.key === 'ArrowLeft' ? -1 : 1;
                        const newIndex = (index + direction + this.tabButtons.length) % this.tabButtons.length;
                        this.switchTab(newIndex);
                        this.tabButtons[newIndex].focus();
                    }
                });
            });
        }
        
        switchTab(activeIndex) {
            // 更新按钮状态
            this.tabButtons.forEach((button, index) => {
                const isActive = index === activeIndex;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-selected', isActive);
            });
            
            // 更新面板状态
            this.tabPanels.forEach((panel, index) => {
                panel.classList.toggle('active', index === activeIndex);
            });
            
            // 发送自定义事件
            document.dispatchEvent(new CustomEvent('tabChanged', {
                detail: { activeIndex }
            }));
        }
    }
    
    // 懒加载图片
    class LazyLoader {
        constructor() {
            this.images = document.querySelectorAll('img[data-src]');
            this.imageObserver = null;
            
            this.init();
        }
        
        init() {
            if (!this.images.length) return;
            
            if ('IntersectionObserver' in window) {
                this.imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            this.imageObserver.unobserve(entry.target);
                        }
                    });
                }, {
                    rootMargin: '50px 0px'
                });
                
                this.images.forEach(img => this.imageObserver.observe(img));
            } else {
                // 回退方案
                this.images.forEach(img => this.loadImage(img));
            }
        }
        
        loadImage(img) {
            const src = img.getAttribute('data-src');
            if (!src) return;
            
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        }
    }
    
    // 表单处理
    class FormHandler {
        constructor() {
            this.forms = document.querySelectorAll('form');
            this.init();
        }
        
        init() {
            this.forms.forEach(form => {
                form.addEventListener('submit', (e) => this.handleSubmit(e));
                
                // 实时验证
                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('input', utils.debounce(() => this.validateField(input), 300));
                });
            });
        }
        
        handleSubmit(e) {
            e.preventDefault();
            const form = e.target;
            
            if (this.validateForm(form)) {
                this.submitForm(form);
            }
        }
        
        validateForm(form) {
            const inputs = form.querySelectorAll('input, textarea, select');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });
            
            return isValid;
        }
        
        validateField(field) {
            const value = field.value.trim();
            const type = field.type;
            const required = field.hasAttribute('required');
            
            let isValid = true;
            let message = '';
            
            if (required && !value) {
                isValid = false;
                message = '此字段为必填项';
            } else if (value) {
                switch (type) {
                    case 'email':
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            isValid = false;
                            message = '请输入有效的邮箱地址';
                        }
                        break;
                    case 'tel':
                        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                        if (!phoneRegex.test(value)) {
                            isValid = false;
                            message = '请输入有效的电话号码';
                        }
                        break;
                }
            }
            
            this.showFieldValidation(field, isValid, message);
            return isValid;
        }
        
        showFieldValidation(field, isValid, message) {
            const errorElement = field.parentNode.querySelector('.field-error');
            
            if (!isValid) {
                field.classList.add('error');
                if (!errorElement) {
                    const error = document.createElement('div');
                    error.className = 'field-error';
                    error.textContent = message;
                    field.parentNode.appendChild(error);
                } else {
                    errorElement.textContent = message;
                }
            } else {
                field.classList.remove('error');
                if (errorElement) {
                    errorElement.remove();
                }
            }
        }
        
        async submitForm(form) {
            const submitBtn = form.querySelector('[type="submit"]');
            const originalText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = '提交中...';
                
                const formData = new FormData(form);
                const response = await fetch(form.action || '/contact', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    this.showMessage('表单提交成功！', 'success');
                    form.reset();
                } else {
                    throw new Error('提交失败');
                }
            } catch (error) {
                this.showMessage('提交失败，请稍后重试', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
        
        showMessage(text, type) {
            const message = document.createElement('div');
            message.className = `form-message ${type}`;
            message.textContent = text;
            
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                message.classList.remove('show');
                setTimeout(() => message.remove(), 300);
            }, 3000);
        }
    }
    
    // 性能监控
    class PerformanceMonitor {
        constructor() {
            this.init();
        }
        
        init() {
            // 监控页面加载性能
            window.addEventListener('load', () => {
                setTimeout(() => this.measurePerformance(), 0);
            });
            
            // 监控Core Web Vitals
            this.measureCoreWebVitals();
        }
        
        measurePerformance() {
            if ('performance' in window) {
                const navigation = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                
                const metrics = {
                    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
                };
                
                console.log('Performance Metrics:', metrics);
                
                // 发送到分析服务
                this.sendAnalytics('performance', metrics);
            }
        }
        
        measureCoreWebVitals() {
            // LCP (Largest Contentful Paint)
            if ('PerformanceObserver' in window) {
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.startTime);
                    this.sendAnalytics('lcp', lastEntry.startTime);
                }).observe({ entryTypes: ['largest-contentful-paint'] });
                
                // FID (First Input Delay)
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        console.log('FID:', entry.processingStart - entry.startTime);
                        this.sendAnalytics('fid', entry.processingStart - entry.startTime);
                    });
                }).observe({ entryTypes: ['first-input'] });
                
                // CLS (Cumulative Layout Shift)
                let clsValue = 0;
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    console.log('CLS:', clsValue);
                    this.sendAnalytics('cls', clsValue);
                }).observe({ entryTypes: ['layout-shift'] });
            }
        }
        
        sendAnalytics(metric, value) {
            // 发送到Google Analytics或其他分析服务
            if (typeof gtag !== 'undefined') {
                gtag('event', 'web_vitals', {
                    metric_name: metric,
                    metric_value: Math.round(value),
                    custom_parameter: window.location.pathname
                });
            }
        }
    }
    
    // SEO优化功能
    class SEOOptimizer {
        constructor() {
            this.init();
        }
        
        init() {
            this.updateMetaTags();
            this.addStructuredData();
            this.optimizeImages();
            this.trackUserBehavior();
        }
        
        updateMetaTags() {
            // 动态更新页面标题和描述
            const currentPage = window.location.pathname;
            const pageConfig = this.getPageConfig(currentPage);
            
            if (pageConfig) {
                document.title = pageConfig.title;
                
                const metaDescription = document.querySelector('meta[name="description"]');
                if (metaDescription) {
                    metaDescription.setAttribute('content', pageConfig.description);
                }
            }
        }
        
        getPageConfig(path) {
            const configs = {
                '/': {
                    title: '国际短信群发_国际短信收费_国际短信平台_国际短信通道-牛子通信官网',
                    description: '牛子通信提供全球范围内的国际短信群发通道，通过高效、便捷、安全的群发平台，帮助您快速发送国际短信,实现企业与客户的高效营销。覆盖全球230个国家和地区。'
                },
                '/sms.html': {
                    title: '国际短信服务_海外短信平台_全球短信通道-牛子通信',
                    description: '专业的国际短信服务，支持验证码短信、营销短信、双向短信，覆盖全球230个国家和地区，99.9%到达率保证。'
                }
            };
            
            return configs[path];
        }
        
        addStructuredData() {
            // 添加面包屑结构化数据
            const breadcrumbs = this.generateBreadcrumbs();
            if (breadcrumbs.length > 1) {
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.textContent = JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    'itemListElement': breadcrumbs.map((item, index) => ({
                        '@type': 'ListItem',
                        'position': index + 1,
                        'name': item.name,
                        'item': item.url
                    }))
                });
                document.head.appendChild(script);
            }
        }
        
        generateBreadcrumbs() {
            const path = window.location.pathname;
            const segments = path.split('/').filter(segment => segment);
            const breadcrumbs = [{ name: '首页', url: window.location.origin }];
            
            let currentPath = '';
            segments.forEach(segment => {
                currentPath += '/' + segment;
                const name = this.getPageName(segment);
                breadcrumbs.push({
                    name: name,
                    url: window.location.origin + currentPath
                });
            });
            
            return breadcrumbs;
        }
        
        getPageName(segment) {
            const names = {
                'sms': '国际短信',
                'voice': '国际语音',
                'group-call': '语音群呼',
                'web-call': '语音外呼',
                'faq': '常见问题'
            };
            
            return names[segment] || segment;
        }
        
        optimizeImages() {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                // 添加loading="lazy"属性
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
                
                // 确保所有图片都有alt属性
                if (!img.hasAttribute('alt')) {
                    img.setAttribute('alt', '');
                }
            });
        }
        
        trackUserBehavior() {
            // 跟踪用户滚动深度
            let maxScroll = 0;
            const trackScroll = utils.throttle(() => {
                const scrollPercent = Math.round(
                    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                );
                
                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                    
                    // 发送滚动深度事件
                    if (typeof gtag !== 'undefined' && scrollPercent % 25 === 0) {
                        gtag('event', 'scroll_depth', {
                            percent_scrolled: scrollPercent
                        });
                    }
                }
            }, 1000);
            
            window.addEventListener('scroll', trackScroll);
            
            // 跟踪页面停留时间
            let startTime = Date.now();
            window.addEventListener('beforeunload', () => {
                const timeSpent = Math.round((Date.now() - startTime) / 1000);
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'time_on_page', {
                        value: timeSpent
                    });
                }
            });
        }
    }
    
    // 初始化所有功能
    function init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }
    }
    
    function initializeApp() {
        // 初始化各个模块
        new MobileMenu();
        new TabSystem();
        new LazyLoader();
        new FormHandler();
        new PerformanceMonitor();
        new SEOOptimizer();
        
        // 添加平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    utils.smoothScrollTo(target, 80);
                }
            });
        });
        
        // 添加返回顶部功能
        const backToTop = document.createElement('button');
        backToTop.innerHTML = '↑';
        backToTop.className = 'back-to-top';
        backToTop.setAttribute('aria-label', '返回顶部');
        backToTop.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border: none;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            font-size: 20px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
        `;
        
        document.body.appendChild(backToTop);
        
        const toggleBackToTop = utils.throttle(() => {
            if (window.scrollY > 300) {
                backToTop.style.opacity = '1';
                backToTop.style.visibility = 'visible';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
            }
        }, 100);
        
        window.addEventListener('scroll', toggleBackToTop);
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        console.log('牛子通信网站已初始化完成');
    }
    
    // 启动应用
    init();
    
})();