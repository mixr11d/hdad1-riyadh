/**
 * ==========================================================================
 * Project: الأول في الرياض للمظلات والسواتر والساندوتش بانل والبرجولات
 * Architecture: Vanilla JS - Auto Cache Cleaner & Conversion Engine
 * ==========================================================================
 */

(function () {
  'use strict';

  // تنظيف أي Service Worker قديم أو كاش معلق في متصفح الزائر تلقائياً
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
  if ('caches' in window) {
    caches.keys().then(function (names) {
      for (let name of names) caches.delete(name);
    });
  }

  // 1. الإعدادات وأكواد الإحالة (Google Ads IDs)
  const APP_CONFIG = {
    clientPhone: '966552235142',
    clientPhoneFormatted: '0552235142',
    devPhone: '966578539687',
    googleAds: {
      conversionId: 'AW-18455780287',
      callLabel: '40UPCOqerPwcEL-3s-BE',       // إحالة الاتصال
      whatsAppLabel: 'EXqaCO2erPwcEL-3s-BE',   // إحالة الواتساب
      formLabel: 'Wj4wCLOWp_wcEL-3s-BE'        // إحالة إرسال النموذج/الحاسبة
    },
    pricingRates: {
      'shades': 90,
      'fences': 110,
      'sandwich-panel': 160,
      'pergolas': 180
    }
  };

  // تهيئة dataLayer فوراً لتخزين الأحداث حتى لو لم يُحمل السكربت بعد
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  let scriptInjected = false;

  function isDeveloperSession() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev_preview') === 'true') return true;
    if (localStorage.getItem('is_dev_mode') === 'true') return true;
    return false;
  }

  // تحميل سكربت Google Ads
  function injectGoogleAdsScript() {
    if (scriptInjected || isDeveloperSession()) return;
    scriptInjected = true;

    gtag('js', new Date());
    gtag('config', APP_CONFIG.googleAds.conversionId);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${APP_CONFIG.googleAds.conversionId}`;
    document.head.appendChild(script);
  }

  // تجهيز وتحميل السكربت بأمان
  function scheduleScriptLoad() {
    const triggerEvents = ['mousemove', 'touchstart', 'scroll', 'keydown'];
    const handler = function () {
      injectGoogleAdsScript();
      triggerEvents.forEach(evt => window.removeEventListener(evt, handler));
    };

    triggerEvents.forEach(evt => window.addEventListener(evt, handler, { passive: true, once: true }));
    
    // تحميل احتياطي بعد ثانيتين تلقائياً لضمان الجاهزية
    setTimeout(injectGoogleAdsScript, 2000);
  }

  // دالة إرسال الإحالة الناجحة (Conversion Reporter)
  window.reportConversion = function (conversionType, customCallback) {
    injectGoogleAdsScript();

    let executed = false;
    const runCallbackOnce = function () {
      if (!executed) {
        executed = true;
        if (typeof customCallback === 'function') customCallback();
      }
    };

    if (isDeveloperSession()) {
      runCallbackOnce();
      return;
    }

    let label = '';
    if (conversionType === 'call') label = APP_CONFIG.googleAds.callLabel;
    if (conversionType === 'whatsapp') label = APP_CONFIG.googleAds.whatsAppLabel;
    if (conversionType === 'form') label = APP_CONFIG.googleAds.formLabel;

    // مهلة أمان لضمان عدم تعليق المتصفح في حال تأخر جوجل
    const safetyTimeout = setTimeout(runCallbackOnce, 500);

    if (label && !label.includes('xxxx')) {
      try {
        gtag('event', 'conversion', {
          send_to: `${APP_CONFIG.googleAds.conversionId}/${label}`,
          transport_type: 'beacon',
          event_callback: function () {
            clearTimeout(safetyTimeout);
            runCallbackOnce();
          }
        });
      } catch (e) {
        clearTimeout(safetyTimeout);
        runCallbackOnce();
      }
    } else {
      clearTimeout(safetyTimeout);
      runCallbackOnce();
    }
  };

  // 2. القائمة والتنقل
  function setupNavigation() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const backdrop = document.querySelector('.mobile-drawer-backdrop');
    const drawerCloseBtn = document.querySelector('.mobile-drawer-close');
    const accordionBtn = document.querySelector('.mobile-accordion-btn');
    const accordionContent = document.querySelector('.mobile-accordion-content');

    function toggleDrawer(open) {
      if (!drawer || !backdrop || !hamburgerBtn) return;
      const isOpen = open !== undefined ? open : !drawer.classList.contains('is-open');
      drawer.classList.toggle('is-open', isOpen);
      backdrop.classList.toggle('is-open', isOpen);
      hamburgerBtn.classList.toggle('is-active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => toggleDrawer());
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', () => toggleDrawer(false));
    if (backdrop) backdrop.addEventListener('click', () => toggleDrawer(false));

    if (accordionBtn && accordionContent) {
      accordionBtn.addEventListener('click', function () {
        const isExpanded = accordionContent.classList.contains('is-expanded');
        accordionContent.classList.toggle('is-expanded', !isExpanded);
        const icon = accordionBtn.querySelector('.accordion-chevron');
        if (icon) {
          icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      });
    }
  }

  // 3. زر الصعود للأعلى
  function setupBackToTop() {
    const scrollBtn = document.querySelector('.floating-scroll-left');
    if (!scrollBtn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 380) {
        scrollBtn.classList.add('is-visible');
      } else {
        scrollBtn.classList.remove('is-visible');
      }
    }, { passive: true });

    scrollBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 4. حاسبة الأسعار ونموذج الطلب
  function setupQuoteCalculator() {
    const calcForm = document.getElementById('quick-quote-form');
    if (!calcForm) return;

    const serviceSelect = calcForm.querySelector('[name="service_type"]');
    const areaInput = calcForm.querySelector('[name="project_area"]');
    const resultDisplay = document.getElementById('calc-estimate-value');

    function calculateEstimate() {
      if (!resultDisplay || !serviceSelect || !areaInput) return;
      const rate = APP_CONFIG.pricingRates[serviceSelect.value] || 0;
      const area = parseFloat(areaInput.value) || 0;
      const total = rate * area;

      if (total > 0) {
        resultDisplay.textContent = `${total.toLocaleString('ar-SA')} ر.س تقريباً`;
      } else {
        resultDisplay.textContent = '-- ر.س';
      }
    }

    if (serviceSelect) serviceSelect.addEventListener('change', calculateEstimate);
    if (areaInput) areaInput.addEventListener('input', calculateEstimate);

    calcForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const district = calcForm.querySelector('[name="district"]')?.value || 'مدينة الرياض';
      const serviceName = serviceSelect?.options[serviceSelect.selectedIndex]?.text || 'مظلات وسواتر';
      const areaVal = areaInput?.value || 'غير محددة';

      const messageText = `السلام عليكم ورحمة الله، أود طلب تسعيرة فورية ومعاينة:\n- الخدمة: ${serviceName}\n- الحي: ${district}\n- المساحة: ${areaVal} م²\n- المصدر: الموقع الإلكتروني`;
      const encodedMsg = encodeURIComponent(messageText);
      const targetUrl = `https://wa.me/${APP_CONFIG.clientPhone}?text=${encodedMsg}`;

      // إرسال إحالة النموذج قبل تحويل العميل للواتساب
      window.reportConversion('form', function () {
        window.location.href = targetUrl;
      });
    });
  }

  // 5. تتبع نقرات الاتصال والواتساب لجميع الروابط
  function setupConversionClickTrackers() {
    let lastClickTime = 0;

    document.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href') || '';

      // استثناء رقم المطور
      if (href.includes(APP_CONFIG.devPhone) || href.includes('0578539687')) {
        return;
      }

      const now = Date.now();
      if (now - lastClickTime < 700) return;

      // تتبع نقرات الاتصال
      if (href.startsWith('tel:')) {
        lastClickTime = now;
        window.reportConversion('call');
        return;
      }

      // تتبع نقرات الواتساب
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        lastClickTime = now;
        
        // إذا كان الرابط يفتح في نفس الصفحة، نؤخر الانتقال قليلاً حتى تُسجل الإحالة
        if (!link.target || link.target === '_self') {
          e.preventDefault();
          window.reportConversion('whatsapp', function () {
            window.location.href = href;
          });
        } else {
          window.reportConversion('whatsapp');
        }
      }
    }, true);
  }

  // تشغيل كل الوظائف عند جاهزية الـ DOM
  document.addEventListener('DOMContentLoaded', function () {
    scheduleScriptLoad();
    setupNavigation();
    setupBackToTop();
    setupQuoteCalculator();
    setupConversionClickTrackers();
  });

})();
