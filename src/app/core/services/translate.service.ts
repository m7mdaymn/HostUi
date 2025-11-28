import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Lang = 'en' | 'ar';

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    home: 'Home',
    hosting: 'Hosting',
    dedicated: 'Dedicated Hosting',
    vps: 'VPS Hosting',
    promos: 'Promos',
    contact: 'Contact us',
    orderNow: 'Order Now',
    getStarted: 'Get Started',
    choosePlan: 'Choose the Plan',
    whyChoose: 'Why Choose TopServers For Your Dedicated Server Hosting?',
    dedicatedIntro: 'TopServers provides reliable dedicated servers with configurable CPU, RAM, storage and network options. Choose from curated configurations or filter to find the exact machine you need.',
    filterServers: 'Filter servers',
    cpuCores: 'CPU cores',
    ram: 'RAM (GB)',
    brand: 'Brand',
    maxPrice: 'Max price (USD)',
    noDedicatedFound: 'No dedicated servers found.',
    fullBannerTitle: 'Perfect <span class="text-base">Hosting</span> Service For You',
    getHosting: 'Get Hosting',
    whyChooseUs: 'Why <span class="text-base">Choose Us</span>',
    chooseUsDesc: 'We go beyond servers to provide performance, security, and support that empowers your online success.',
    smartWorkTitle: 'Our Smart Work',
    smartWorkDesc: 'Intelligent automation for optimal performance and hassle-free management.',
    emailTitle: 'Professional Email',
    emailDesc: 'Professional email hosting included with every plan to build your brand identity.',
    supportTitle: 'Dedicated 24/7 Support',
    supportDesc: 'Round-the-clock expert support from our in-house team, whenever you need it.',
    serverProtectionTitle: 'Server Level Protection',
    serverProtectionDesc: 'Proactive, enterprise-grade security monitoring to defend against modern threats.',
    cloudIntegrationTitle: 'Cloud Integration',
    cloudIntegrationDesc: 'Scalable, resilient cloud infrastructure that grows with your traffic demands.',
    hostingPlanTitle: 'Hosting Plan',
    hostingPlanDesc: 'Find the perfect fit with our flexible plans, designed for projects of any size.',
    viewMoreAdvantages: 'View More Advantages',
    servicesTitle: 'Our <span class="text-base">Services</span>',
    servicesDesc: 'Choose the hosting plan that best fits your needs and budget.',
    tabDedicated: 'Dedicated Hosting',
    tabVps: 'VPS Hosting',
    tabDedicatedTitle: '<span class="text-base">Dedicated</span> Hosting',
    tabVpsTitle: '<span class="text-base">VPS</span> Hosting',
    tabListItem1: 'Manage Web Apps More Collaboration',
    tabListItem2: 'Update Web Hosting Collaboration',
    tabListItem3: 'Creative Web Domain Collaboration',
    premiumHosting: 'Premium <span class="text-base">Hosting</span>',
    premiumDesc: 'Choose the hosting plan that suits your business requirements and scale as you grow.'
    ,
    headerAccount: 'Account',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    footerServices: 'Services',
    footerVpsPlans: 'VPS Plans',
    footerDedicated: 'Dedicated Servers',
    footerPrivacy: 'Privacy',
    footerTerms: 'Terms & Conditions',
    copyrightBy: 'Copyright © 2025 | Designed by <a href="https://wa.me/+201029907297">Nova Node</a>'
  },
  ar: {
    home: 'الرئيسية',
    hosting: 'الاستضافة',
    dedicated: 'خوادم مخصصة',
    vps: 'خوادم VPS',
    promos: 'العروض',
    contact: 'اتصل بنا',
    orderNow: 'اطلب الآن',
    getStarted: 'ابدأ الآن',
    choosePlan: 'اختر الخطة',
    whyChoose: 'لماذا تختار TopServers لخوادم الاستضافة المخصصة؟',
    dedicatedIntro: 'توفر TopServers خوادمًا مخصصة موثوقة مع خيارات قابلة للتكوين للمعالج، والذاكرة، والتخزين والشبكة. اختر من التكوينات المعدة مسبقًا أو قم بالتصفية للعثور على الجهاز المناسب لاحتياجاتك.',
    filterServers: 'تصفية الخوادم',
    cpuCores: 'عدد نوى المعالج',
    ram: 'الذاكرة (جيجابايت)',
    brand: 'الماركة',
    maxPrice: 'أقصى سعر (دولار)',
    noDedicatedFound: 'لا توجد خوادم مخصصة.',
    fullBannerTitle: 'خدمة <span class="text-base">الاستضافة</span> المثالية لك',
    getHosting: 'احصل على استضافة',
    whyChooseUs: 'لماذا <span class="text-base">تختارنا</span>',
    chooseUsDesc: 'نقدم أكثر من الخوادم — الأداء والأمان والدعم لنجاحك على الإنترنت.',
    smartWorkTitle: 'عملنا الذكي',
    smartWorkDesc: 'أتمتة ذكية لأداء أمثل وإدارة خالية من المتاعب.',
    emailTitle: 'بريد إلكتروني احترافي',
    emailDesc: 'بريد إلكتروني احترافي مدرج مع كل خطة لبناء هوية علامتك التجارية.',
    supportTitle: 'دعم 24/7 مخصص',
    supportDesc: 'دعم خبراء على مدار الساعة من فريقنا الداخلي عند الحاجة.',
    serverProtectionTitle: 'حماية على مستوى الخادم',
    serverProtectionDesc: 'مراقبة أمان مؤسسية استباقية للدفاع ضد التهديدات الحديثة.',
    cloudIntegrationTitle: 'تكامل السحابة',
    cloudIntegrationDesc: 'بنية سحابية قابلة للتوسع ومرنة تنمو مع حركة المرور لديك.',
    hostingPlanTitle: 'خطة الاستضافة',
    hostingPlanDesc: 'اعثر على الخيار المناسب مع خططنا المرنة المصممة لمشروعاتك.',
    viewMoreAdvantages: 'عرض المزيد من المزايا',
    servicesTitle: 'خدماتنا',
    servicesDesc: 'اختر خطة الاستضافة التي تناسب احتياجاتك وميزانيتك.',
    tabDedicated: 'استضافة مخصصة',
    tabVps: 'استضافة VPS',
    tabDedicatedTitle: '<span class="text-base">مخصصة</span> استضافة',
    tabVpsTitle: '<span class="text-base">VPS</span> استضافة',
    tabListItem1: 'إدارة التطبيقات بمزيد من التعاون',
    tabListItem2: 'تحديث استضافة الويب',
    tabListItem3: 'دومين إبداعي',
    premiumHosting: 'استضافة <span class="text-base">مميزة</span>',
    premiumDesc: 'اختر خطة الاستضافة التي تناسب متطلبات عملك وقم بالتوسع عند النمو.',
    headerAccount: 'الحساب',
    signIn: 'تسجيل الدخول',
    signUp: 'انشاء حساب',
    footerServices: 'الخدمات',
    footerVpsPlans: 'خطط VPS',
    footerDedicated: 'الخوادم المخصصة',
    footerPrivacy: 'الخصوصية',
    footerTerms: 'الشروط والأحكام',
    copyrightBy: 'حقوق النشر © 2025 | مصمم بواسطة <a href="https://wa.me/+201029907297">نوفا نود</a>'
  }
};

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private lang$ = new BehaviorSubject<Lang>((localStorage.getItem('lang') as Lang) || 'en');
  lang = this.lang$.asObservable();

  get current() { return this.lang$.value; }

  setLang(l: Lang) {
    this.lang$.next(l);
    localStorage.setItem('lang', l);
    this.applyDirection(l);
  }

  t(key: string) {
    return DICT[this.current]?.[key] || DICT['en'][key] || key;
  }

  private applyDirection(l: Lang) {
    const dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
    document.documentElement.dir = dir;
  }
}
