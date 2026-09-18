/**
 * ==========================================================================
 * تتبع إحالات جوجل أدز ونموذج الموقع
 * ==========================================================================
 */
(function () {
  'use strict';

  const GOOGLE_ADS_ID = 'AW-18455780287';
  const LABELS = {
    call: '40UPCOqerPwcEL-3s-BE',       // إحالة الاتصال
    whatsapp: 'EXqaCO2erPwcEL-3s-BE',   // إحالة الواتساب
    form: 'Wj4wCLOWp_wcEL-3s-BE'        // إحالة النموذج
  };
  const CLIENT_PHONE = '966552235142';

  // دالة إرسال الإحالة إلى جوجل
  function triggerConversion(actionType, callback) {
    const label = LABELS[actionType];
    let callbackFired = false;

    function doCallback() {
      if (!callbackFired) {
        callbackFired = true;
        if (typeof callback === 'function') callback();
      }
    }

    // أقصى مهلة انتظار 500ms حتى لا يتعطل التصفح
    setTimeout(doCallback, 500);

    if (typeof window.gtag === 'function' && label) {
      window.gtag('event', 'conversion', {
        send_to: `${GOOGLE_ADS_ID}/${label}`,
        event_callback: doCallback
      });
    } else {
      doCallback();
    }
  }

  // ربط الأحداث بعد تحميل العناصر
  document.addEventListener('DOMContentLoaded', function () {

    // 1. تتبع نقرات الاتصال (Call) والواتساب (WhatsApp)
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href') || '';

      // استبعاد رقم المطور
      if (href.includes('0578539687')) return;

      // عند الضغط على أي زر اتصال
      if (href.startsWith('tel:')) {
        triggerConversion('call');
      }

      // عند الضغط على أي زر واتساب
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        triggerConversion('whatsapp');
      }
    });

    // 2. تتبع إرسال نموذج الحاسبة (Form)
    const calcForm = document.getElementById('quick-quote-form');
    if (calcForm) {
      calcForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const serviceSelect = calcForm.querySelector('[name="service_type"]');
        const areaInput = calcForm.querySelector('[name="project_area"]');
        const district = calcForm.querySelector('[name="district"]')?.value || 'مدينة الرياض';
        const serviceName = serviceSelect?.options[serviceSelect.selectedIndex]?.text || 'مظلات وسواتر';
        const areaVal = areaInput?.value || 'غير محددة';

        const msg = `السلام عليكم ورحمة الله، أود طلب تسعيرة فورية ومعاينة:\n- الخدمة: ${serviceName}\n- الحي: ${district}\n- المساحة: ${areaVal} م²\n- المصدر: الموقع الإلكتروني`;
        const targetUrl = `https://wa.me/${CLIENT_PHONE}?text=${encodeURIComponent(msg)}`;

        // إرسال إحالة النموذج ثم الانتقال للواتساب
        triggerConversion('form', function () {
          window.location.href = targetUrl;
        });
      });
    }

  });
})();
