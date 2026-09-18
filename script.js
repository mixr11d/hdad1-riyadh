/**
 * ==========================================================================
 * السكربت المستقل الشامل لجميع صفحات الموقع (All-in-One Autonomous Engine)
 * يتولى حقن كود Google Ads وتتبع (الاتصال + الواتساب + كل النماذج) في كامل الموقع
 * ==========================================================================
 */

(function () {
  'use strict';

  // 1. إعدادات حساب Google Ads وأرقام التواصل
  const GOOGLE_CONFIG = {
    conversionId: 'AW-18455780287',
    labels: {
      call: '40UPCOqerPwcEL-3s-BE',       // إحالة الاتصال
      whatsapp: 'EXqaCO2erPwcEL-3s-BE',   // إحالة الواتساب
      form: 'Wj4wCLOWp_wcEL-3s-BE'        // إحالة جميع النماذج
    },
    clientPhone: '966552235142',
    devPhone: '0578539687'
  };

  // 2. الحقن والتهيئة الذاتية الفورية لكود Google Ads في أي صفحة تفتقر إليه
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  // إذا لم يكن كود جوجل موجوداً في الـ <head>، يتم تثبيته وتشغيله فوراً تلقائياً
  if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    gtag('js', new Date());
    gtag('config', GOOGLE_CONFIG.conversionId);

    const gTagScript = document.createElement('script');
    gTagScript.async = true;
    gTagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_CONFIG.conversionId}`;
    (document.head || document.documentElement).appendChild(gTagScript);
  }

  // 3. دالة إرسال الإحالة العالمية الموحدة
  function triggerConversion(type) {
    const label = GOOGLE_CONFIG.labels[type];
    if (typeof window.gtag === 'function' && label) {
      window.gtag('event', 'conversion', {
        'send_to': `${GOOGLE_CONFIG.conversionId}/${label}`,
        'transport_type': 'beacon'
      });
    }
  }

  // إتاحة الدوال للاستدعاء العام
  window.reportCallConversion = function () { triggerConversion('call'); };
  window.reportWhatsappConversion = function () { triggerConversion('whatsapp'); };
  window.reportFormConversion = function () { triggerConversion('form'); };

  // 4. مراقبة الموقع بالكامل لجميع الأحداث فور تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function () {

    // [أ] مراقبة نقرات الاتصال والواتساب في كل صفحات الموقع
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      if (href.includes(GOOGLE_CONFIG.devPhone)) return; // استبعاد رقم المطور

      // تتبع أي اتصال عبر الموقع
      if (href.startsWith('tel:')) {
        triggerConversion('call');
      }

      // تتبع أي محادثة واتساب عبر الموقع
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        triggerConversion('whatsapp');
      }
    }, true);

    // [ب] مراقبة إرسال أي نموذج في أي صفحة (الرئيسية، اتصل بنا، أو غيرها)
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!form || form.tagName !== 'FORM') return;

      // 1. تسجيل إحالة النموذج في Google Ads لأي فورم في الموقع تلقائياً
      triggerConversion('form');

      // 2. إذا كان النموذج هو حاسبة الأسعار السريعة (في الرئيسية)
      if (form.id === 'quick-quote-form') {
        e.preventDefault();

        const serviceSelect = form.querySelector('[name="service_type"]');
        const serviceName = serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex].text : 'مظلات وسواتر';
        const district = form.querySelector('[name="district"]')?.value || 'مدينة الرياض';
        const area = form.querySelector('[name="project_area"]')?.value || 'غير محددة';

        const msg = `السلام عليكم ورحمة الله، أود طلب تسعيرة فورية ومعاينة:\n- الخدمة: ${serviceName}\n- الحي: ${district}\n- المساحة: ${area} م²\n- المصدر: الموقع الإلكتروني`;
        const targetUrl = `https://wa.me/${GOOGLE_CONFIG.clientPhone}?text=${encodeURIComponent(msg)}`;

        setTimeout(function () {
          window.open(targetUrl, '_blank') || (window.location.href = targetUrl);
        }, 300);
      }
    }, true);

    // [ج] حاسبة الأسعار (تعمل تلقائياً إذا كانت عناصرها موجودة بالصفحة)
    const calcForm = document.getElementById('quick-quote-form');
    if (calcForm) {
      const serviceSelect = calcForm.querySelector('[name="service_type"]');
      const areaInput = calcForm.querySelector('[name="project_area"]');
      const resultDisplay = document.getElementById('calc-estimate-value');
      const rates = { 'shades': 90, 'fences': 110, 'sandwich-panel': 160, 'pergolas': 180 };

      function updateCalc() {
        if (!resultDisplay || !serviceSelect || !areaInput) return;
        const rate = rates[serviceSelect.value] || 0;
        const area = parseFloat(areaInput.value) || 0;
        const total = rate * area;
        resultDisplay.textContent = total > 0 ? `${total.toLocaleString('ar-SA')} ر.س تقريباً` : '-- ر.س';
      }

      if (serviceSelect) serviceSelect.addEventListener('change', updateCalc);
      if (areaInput) areaInput.addEventListener('input', updateCalc);
    }

    // [د] القائمة المتنقلة للموبايل (Mobile Drawer)
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
        if (icon) icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
      });
    }

    // [هـ] زر الصعود للأعلى
    const scrollBtn = document.querySelector('.floating-scroll-left');
    if (scrollBtn) {
      window.addEventListener('scroll', function () {
        scrollBtn.classList.toggle('is-visible', window.scrollY > 380);
      }, { passive: true });

      scrollBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

  });
})();
