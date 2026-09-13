/**
 * ==========================================================================
 * Project: الأول في الرياض للمظلات والسواتر والساندوتش بانل والبرجولات
 * Architecture: Vanilla JS - Ultra High Performance & Conversion Engine
 * Features: Google Ads Tracking, Dev Exclusion, Auto Pre-filled WhatsApp, Lead Engine
 * ==========================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. بيانات النشاط والإعدادات الهندسية (Config)
  // --------------------------------------------------------------------------
  const APP_CONFIG = {
    clientPhone: '966552235142',
    clientPhoneFormatted: '0552235142',
    devPhone: '966578539687',
    googleAds: {
      conversionId: 'AW-xxxxxxxxxxxxx',
      callLabel: 'xxxxxxxxxxxxxxxxx',
      whatsAppLabel: 'xxxxxxxxxxxxxx',
      formLabel: 'xxxxxxxxxxxxxxxxxxx'
    },
    pricingRates: {
      'shades': 90,           // مظلات مواقف سيارات
      'fences': 110,          // سواتر خصوصية للأحواش
      'sandwich-panel': 160,  // ساندوتش بانل معزول
      'pergolas': 180         // برجولات حديد وخشبية
    }
  };

  // --------------------------------------------------------------------------
  // 2. محرك تتبع إعلانات قوقل المحمي في وضع الخمول (Lazy Google Ads Engine)
  // --------------------------------------------------------------------------
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  let scriptInjected = false;

  // استثناء رقم المطور وجلسات المعاينة لمنع حرق الميزانية
  function isDeveloperSession() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev_preview') === 'true') return true;
    if (localStorage.getItem('is_dev_mode') === 'true') return true;
    return false;
  }

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

  // تأجيل تحميل السكربت لوقت خمول المعالج لتحقيق +98% في Core Web Vitals
  function scheduleLazyTracking() {
    const triggerEvents = ['click', 'touchstart', 'scroll'];
    const handler = function () {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(injectGoogleAdsScript, { timeout: 2000 });
      } else {
        setTimeout(injectGoogleAdsScript, 500);
      }
      triggerEvents.forEach(evt => window.removeEventListener(evt, handler));
    };

    triggerEvents.forEach(evt => window.addEventListener(evt, handler, { passive: true, once: true }));
  }

  // إرسال الإحالات المحمية ضد تعليق المستخدم والتكرار
  window.reportConversion = function (conversionType, customCallback) {
    injectGoogleAdsScript();

    let executed = false;
    const runCallbackOnce = function () {
      if (!executed) {
        executed = true;
        if (typeof customCallback === 'function') {
          customCallback();
        }
      }
    };

    if (isDeveloperSession()) {
      console.warn(`[Tracking Bypassed - Dev Mode Active]: Event: ${conversionType}`);
      runCallbackOnce();
      return;
    }

    let label = '';
    if (conversionType === 'call') label = APP_CONFIG.googleAds.callLabel;
    if (conversionType === 'whatsapp') label = APP_CONFIG.googleAds.whatsAppLabel;
    if (conversionType === 'form') label = APP_CONFIG.googleAds.formLabel;

    // مهلة أمان قصوى 600ms تضمن عدم تعليق العميل حتى لو استخدم مانع إعلانات
    const safetyTimeout = setTimeout(runCallbackOnce, 600);

    if (typeof window.gtag === 'function' && label && !label.includes('xxxx')) {
      try {
        window.gtag('event', 'conversion', {
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

  // --------------------------------------------------------------------------
  // 3. إدارة القوائم المنسدلة ودرج الجوال (Navigation & Mobile Drawer)
  // --------------------------------------------------------------------------
  function setupNavigation() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const backdrop = document.querySelector('.mobile-drawer-backdrop');
    const drawerCloseBtn = document.querySelector('.mobile-drawer-close');
    const accordionBtn = document.querySelector('.mobile-accordion-btn');
    const accordionContent = document.querySelector('.mobile-accordion-content');
    const siteHeader = document.querySelector('.site-header');

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

    // أكورديون الخدمات داخل درج الموبايل
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

    // تأثير شريط الهيدر عند التمرير
    window.addEventListener('scroll', function () {
      if (!siteHeader) return;
      if (window.scrollY > 20) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 4. زر الصعود للأعلى (Back To Top Button)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 5. حاسبة التكلفة ونموذج التسعير الفوري للمتر (Instant Quote Calculator)
  // --------------------------------------------------------------------------
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

      const messageText = `السلام عليكم ورحمة الله، أود طلب تسعيرة فورية ومعاينة:\n- الخدمة: ${serviceName}\n- الحي المستهدف: ${district}\n- المساحة التقديرية: ${areaVal} م²\n- المصدر: الموقع الإلكتروني`;
      const encodedMsg = encodeURIComponent(messageText);
      const targetUrl = `https://wa.me/${APP_CONFIG.clientPhone}?text=${encodedMsg}`;

      window.reportConversion('form', function () {
        window.location.href = targetUrl;
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. رصد النقرات التلقائي واستثناء نقرات المطور (Automated Click Tracking)
  // --------------------------------------------------------------------------
  function setupConversionClickTrackers() {
    let lastClickTime = 0;

    document.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href') || '';

      // استثناء رقم المطور لمنع حرق الميزانية
      if (href.includes(APP_CONFIG.devPhone) || href.includes('0578539687')) {
        return;
      }

      // منع النقرات المزدوجة السريعة
      const now = Date.now();
      if (now - lastClickTime < 700) return;

      if (href.startsWith('tel:')) {
        lastClickTime = now;
        window.reportConversion('call');
        return;
      }

      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        lastClickTime = now;
        window.reportConversion('whatsapp');
      }
    }, true);
  }

  // --------------------------------------------------------------------------
  // 7. التهيئة عند جاهزية المستند
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    scheduleLazyTracking();
    setupNavigation();
    setupBackToTop();
    setupQuoteCalculator();
    setupConversionClickTrackers();
  });

})();
