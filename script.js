/**
 * ==========================================================================
 * السكربت الشامل لتتبع جميع إحالات الموقع (Google Ads Universal Tracking)
 * يغطي: جميع أزرار الاتصال + جميع أزرار الواتساب + جميع نماذج الموقع
 * ==========================================================================
 */
(function () {
  'use strict';

  // 1. بيانات الحساب والإحالات من Google Ads
  const GOOGLE_CONFIG = {
    conversionId: 'AW-18455780287',
    labels: {
      call: '40UPCOqerPwcEL-3s-BE',       // إحالة الاتصال الهاتفي
      whatsapp: 'EXqaCO2erPwcEL-3s-BE',   // إحالة محادثات الواتساب
      form: 'Wj4wCLOWp_wcEL-3s-BE'        // إحالة إرسال النماذج والحاسبة
    },
    devPhone: '0578539687'                // رقم المطور للاستثناء
  };

  // 2. تهيئة وتأكيد عمل Google Tag فوراً في الصفحة
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  // التحقق من وجود كود جوجل الأساسي، وإن لم يكن موجوداً يتم استدعاؤه فوراً
  if (!document.querySelector(`script[src*="${GOOGLE_CONFIG.conversionId}"]`)) {
    gtag('js', new Date());
    gtag('config', GOOGLE_CONFIG.conversionId);

    const gascript = document.createElement('script');
    gascript.async = true;
    gascript.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_CONFIG.conversionId}`;
    document.head.appendChild(gascript);
  }

  // 3. دالة إرسال الإحالة الرسمية والمضمونة
  function sendConversion(conversionType, callback) {
    const label = GOOGLE_CONFIG.labels[conversionType];
    let callbackTriggered = false;

    function finish() {
      if (!callbackTriggered) {
        callbackTriggered = true;
        if (typeof callback === 'function') callback();
      }
    }

    // مهلة أمان سريعة 400ms لضمان عدم تعليق المتصفح
    setTimeout(finish, 400);

    if (typeof window.gtag === 'function' && label) {
      try {
        window.gtag('event', 'conversion', {
          'send_to': `${GOOGLE_CONFIG.conversionId}/${label}`,
          'transport_type': 'beacon',
          'event_callback': finish
        });
      } catch (err) {
        finish();
      }
    } else {
      finish();
    }
  }

  // إتاحة الدالة عالمياً لاستخدامها يدوياً إذا لزم الأمر
  window.triggerManualConversion = sendConversion;

  // 4. مراقبة الموقع بالكامل لجميع النقرات والإحالات
  document.addEventListener('DOMContentLoaded', function () {

    // [أ] مراقبة جميع النقرات في أي صفحة (اتصال أو واتساب)
    document.body.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href') || '';

      // استثناء رقم المطور
      if (href.includes(GOOGLE_CONFIG.devPhone)) return;

      // 1. نقرات الاتصال الهاتفي (أي رابط يبدأ بـ tel:)
      if (href.startsWith('tel:')) {
        sendConversion('call');
        return;
      }

      // 2. نقرات الواتساب (أي رابط يحتوي على wa.me أو whatsapp)
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        // إذا كان الرابط يفتح في نفس النافذة، نؤخره لـ 300ms حتى يستلم جوجل الإشارة
        if (!link.target || link.target === '_self') {
          e.preventDefault();
          sendConversion('whatsapp', function () {
            window.location.href = href;
          });
        } else {
          sendConversion('whatsapp');
        }
      }
    }, true);

    // [ب] مراقبة جميع النماذج والحاسبات في أي صفحة (Forms)
    document.body.addEventListener('submit', function (e) {
      const form = e.target;
      if (!form || form.nodeName !== 'FORM') return;

      // إذا كان النموذج هو حاسبة الأسعار المتجهة للواتساب
      if (form.id === 'quick-quote-form') {
        e.preventDefault();

        const service = form.querySelector('[name="service_type"]')?.selectedOptions[0]?.text || 'مظلات وسواتر';
        const area = form.querySelector('[name="project_area"]')?.value || 'غير محددة';
        const district = form.querySelector('[name="district"]')?.value || 'مدينة الرياض';

        const msg = `السلام عليكم ورحمة الله، أود طلب تسعيرة فورية ومعاينة:\n- الخدمة: ${service}\n- الحي: ${district}\n- المساحة: ${area} م²\n- المصدر: الموقع الإلكتروني`;
        const waUrl = `https://wa.me/966552235142?text=${encodeURIComponent(msg)}`;

        sendConversion('form', function () {
          window.open(waUrl, '_blank') || (window.location.href = waUrl);
        });
        return;
      }

      // لأي نموذج تواصل عادي آخر في أي صفحة
      sendConversion('form');
    }, true);

  });

})();
