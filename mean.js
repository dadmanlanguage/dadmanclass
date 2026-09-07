tailwind.config = {
            darkMode: 'class',
        }

const themeIcon = document.getElementById('themeIcon');

        function initTheme() {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
                themeIcon.className = "fa-solid fa-sun text-lg";
            } else {
                document.documentElement.classList.remove('dark');
                themeIcon.className = "fa-solid fa-moon text-lg";
            }
        }

        function toggleTheme() {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
                themeIcon.className = "fa-solid fa-moon text-lg";
            } else {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
                themeIcon.className = "fa-solid fa-sun text-lg";
            }
        }

        initTheme();

        /* ===================== دکمه اندازه متن (دسترسی‌پذیری) ===================== */
        const fontSizeScales = ['87.5%', '100%', '112%', '125%', '137.5%'];
        const fontSizeDefaultIndex = 1;
        let fontSizeIndex = fontSizeDefaultIndex;

        function applyFontSize(index) {
            fontSizeIndex = Math.min(Math.max(index, 0), fontSizeScales.length - 1);
            document.documentElement.style.fontSize = fontSizeScales[fontSizeIndex];
        }

        function changeFontSize(direction) {
            applyFontSize(fontSizeIndex + direction);
            try { localStorage.fontSizeIndex = String(fontSizeIndex); } catch (e) {}
        }

        (function initFontSize() {
            let idx = fontSizeDefaultIndex;
            try {
                const saved = parseInt(localStorage.fontSizeIndex, 10);
                if (!isNaN(saved) && saved >= 0 && saved < fontSizeScales.length) idx = saved;
            } catch (e) {}
            applyFontSize(idx);
        })();

        const mainForm = document.getElementById('mainContactForm');
        const submitBtn = document.getElementById('submitBtn');
        const errorBox = document.getElementById('formErrorBox');
        const errorText = document.getElementById('formErrorText');

        mainForm.addEventListener('submit', function (event) {
            event.preventDefault();

            errorBox.classList.add('hidden');
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');

            const name = document.getElementById('fullName').value;
            const phone = document.getElementById('phoneNumber').value;
            const request = document.getElementById('requestType').value;

            const formData = new FormData(mainForm);

            fetch(mainForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(async (response) => {
                if (response.ok) {
                    document.getElementById('modalDesc').innerText = `کاربر گرامی (${name})، درخواست شما برای دوره «${request}» با شماره تماس (${phone}) ثبت شد. مشاوران دادمان به زودی با شما تماس می‌گیرند.`;
                    const modal = document.getElementById('customModal');
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                    mainForm.reset();
                } else {
                    let message = 'مشکلی در ارسال فرم پیش آمد. لطفاً کمی بعد دوباره تلاش کنید یا با شماره ۰۲۱-۳۳۴۷۹۰۵۴ تماس بگیرید.';
                    try {
                        const data = await response.json();
                        if (data && data.errors && data.errors.length) {
                            message = data.errors.map(e => e.message).join(' | ');
                        }
                    } catch (e) { }
                    errorText.innerText = message;
                    errorBox.classList.remove('hidden');
                }
            })
            .catch(function () {
                errorText.innerText = 'ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.';
                errorBox.classList.remove('hidden');
            })
            .finally(function () {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
            });
        });

        function closeModal() {
            const modal = document.getElementById('customModal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }

        function showComingSoon(event, title) {
            if (event) event.preventDefault();
            const modal = document.getElementById('comingSoonModal');
            const titleEl = document.getElementById('comingSoonTitle');
            if (titleEl) titleEl.innerText = title || 'این بخش';
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeComingSoonModal() {
            const modal = document.getElementById('comingSoonModal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }

        function toggleFloatMenu(event) {
            if (event) event.stopPropagation();
            document.querySelector('.float-actions').classList.toggle('float-open');
        }

        document.addEventListener('click', function (event) {
            const floatActions = document.querySelector('.float-actions');
            if (floatActions && !floatActions.contains(event.target)) {
                floatActions.classList.remove('float-open');
            }
        });

        document.addEventListener('DOMContentLoaded', function () {
            const revealElements = document.querySelectorAll('.reveal, .reveal-scale');

            if (!('IntersectionObserver' in window)) {
                revealElements.forEach(el => el.classList.add('reveal-visible'));
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-visible');
                    } else {
                        entry.target.classList.remove('reveal-visible');
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -60px 0px'
            });

            revealElements.forEach(el => observer.observe(el));
        });

        /* ===================== سیستم چند زبانه سایت ===================== */
        const translations = {
            fa: {
                subnavStudents: "دانش‌آموزان DTS",
                subnavMethod: "نحوه‌ی تدریس",
                subnavBooks: "کتاب‌هایی که ما تدریس می‌کنیم",
                brandName: "موسسه زبان دادمان",
                brandTagline: "آموزش تخصصی زبان‌های خارجی",
                navHome: "خانه",
                navStudents: "دانش‌آموزان DTS",
                navBenefits: "مزایای دادمان",
                navCourses: "انواع دوره‌ها و جلسات",
                navContact: "مشاوره رایگان",
                navQuickSignup: "ثبت نام سریع",
                heroBadge: "پشتیبانی تا تسلط کامل بر زبان",
                heroTitlePrefix: "آینده تحصیلی و شغلی‌ات را با",
                heroTitleBrand: "موسسه دادمان",
                heroTitleSuffix: "بساز!",
                heroDesc: "با مجرب‌ترین اساتید، متدهای مدرن آموزشی و برنامه‌ریزی اختصاصی، در کوتاه‌ترین زمان ممکن به هدف زبانی خود برسید. از مکالمه روزمره تا آزمون‌های بین‌المللی همراه شما هستیم.",
                heroFeature1: "اساتید برتر کشور",
                heroFeature2: "متد مکالمه‌محور",
                heroFeature3: "مشاوره و تعیین سطح رایگان",
                formTitle: "درخواست مشاوره رایگان",
                formSubtitle: "فرم زیر را پر کنید تا کارشناسان ما با شما تماس بگیرند",
                formErrorDefault: "مشکلی در ارسال فرم پیش آمد. لطفاً دوباره تلاش کنید یا از طریق تماس تلفنی با ما در ارتباط باشید.",
                formLabelName: "نام و نام خانوادگی",
                formPlaceholderName: "مثال: علی رضایی",
                formLabelPhone: "شماره تماس",
                formLabelType: "نوع درخواست یا دوره مورد نظر",
                formOption1: "دوره‌های مکالمه بزرگسالان",
                formOption2: "آمادگی آزمون آیلتس (IELTS)",
                formOption3: "دوره‌های کودکان و نوجوانان",
                formOption4: "مشاوره عمومی و تعیین سطح",
                formLabelMessage: "توضیحات یا پیام شما",
                formPlaceholderMessage: "(این فیلد اجباری است) لطفاً توضیحات خود را بنویسید...",
                formSubmitBtn: "ثبت درخواست و ارسال به موسسه",
                benefitsKicker: "چرا دادمان؟",
                benefitsTitle: "مزایای رقابتی موسسه زبان دادمان",
                benefitsSubtitle: "ما با فراهم کردن بهترین امکانات، مسیر یادگیری شما را هموارتر می‌کنیم",
                benefit1Title: "اساتید برجسته و مجرب",
                benefit1Desc: "بهره‌گیری از اساتید دارای مدرک بین‌المللی تدریس با سال‌ها سابقه موفق آموزشی.",
                benefit2Title: "تمرکز ۱۰۰٪ روی مکالمه",
                benefit2Desc: "سیستم آموزشی ما بر پایه تقویت مهارت‌های شنیداری و گفتاری از جلسه اول طراحی شده است.",
                benefit3Title: "انعطاف در زمان برگزاری",
                benefit3Desc: "امکان انتخاب جلسات آموزشی در ساعات مختلف صبح، عصر و روزهای آخر هفته متناسب با زمان شما.",
                coursesKicker: "برنامه‌های آموزشی",
                coursesTitle: "انواع جلسات و دوره‌های آموزشی دادمان",
                coursesSubtitle: "دوره‌های تخصصی متناسب با سنین، اهداف و سطوح مختلف زبان‌آموزان",
                course1Title: "جلسات مکالمه بزرگسالان",
                course1Tag: "تضمین روانی در گفتار",
                course1Desc: "این جلسات به صورت گروهی تعاملی برگزار می‌شود و تمرکز اصلی روی سناریوهای واقعی زندگی روزمره و کاری است.",
                course1Li1: "تعداد جلسات: ۱۲ جلسه در ماه",
                course1Li2: "ظرفیت محدود کلاس‌ها (حداکثر ۸ نفر)",
                course2Badge: "پرطرفدار",
                course2Title: "دوره‌های تخصصی آیلتس (IELTS)",
                course2Tag: "ویژه مهاجرت و تحصیل",
                course2Desc: "جلسات فشرده و تخصصی آیلتس با تحلیل دقیق مهارت‌های چهارگانه و آزمون‌های آزمایشی استاندارد (Mock).",
                course2Li1: "برنامه‌ریزی و پشتیبانی اختصاصی",
                course2Li2: "تضمین نمره هدف با اساتید برند",
                course3Title: "کودکان و نوجوانان (Junior)",
                course3Tag: "آموزش با بازی و انیمیشن",
                course3Desc: "سیستم آموزشی نوین مخصوص کودکان که یادگیری زبان انگلیسی را به تجربه‌ای لذت‌بخش و ماندگار تبدیل می‌کند.",
                course3Li1: "استفاده از پلتفرم‌های تعاملی و بازی",
                course3Li2: "تقویت پایه‌ای تلفظ و واژگان",
                courseBookBtn: "رزرو مشاوره",
                footerAbout: "مرجع تخصصی آموزش زبان‌های خارجی با بهره‌گیری از برترین متدهای روز دنیا و اساتید مجرب.",
                footerAddressTitle: "آدرس موسسه",
                footerAddress: "تهران، مشیریه، خیابان سازمان آب",
                footerContactTitle: "تماس با ما",
                footerCopyright: "© تمامی حقوق مادی و معنوی برای موسسه زبان دادمان محفوظ است.",
                successTitle: "درخواست شما با موفقیت ثبت شد!",
                gotItBtn: "متوجه شدم",
                comingSoonDesc: "به زودی فعال خواهد شد.",
                langModalTitle: "انتخاب زبان سایت",
                gamerModalTitle: "تم‌های ویژه گیمرها",
                gamerModalDesc: "یکی از تم‌های نئونی و شیشه‌ای زیر رو انتخاب کن",
                gamerTheme1Desc: "صورتی و فیروزه‌ای نئون، شیشه‌ای تیره",
                gamerTheme2Desc: "سبز هکری روی مشکی محض",
                gamerTheme3Desc: "قرمز و نارنجی آتشین",
                gamerTheme4Desc: "بنفش و صورتی رترو",
                gamerTheme5Desc: "رنگ‌های متغیر مثل لوازم گیمینگ",
                gamerResetOption: "بازگشت به حالت عادی"
            },
            en: {
                subnavStudents: "DTS Students",
                subnavMethod: "Teaching Method",
                subnavBooks: "Books We Teach",
                brandName: "Dadman Language Institute",
                brandTagline: "Specialized Foreign Language Education",
                navHome: "Home",
                navStudents: "DTS Students",
                navBenefits: "Why Dadman",
                navCourses: "Courses & Sessions",
                navContact: "Free Consultation",
                navQuickSignup: "Quick Sign-up",
                heroBadge: "Support Until Full Mastery of the Language",
                heroTitlePrefix: "Build Your Academic and Career Future With",
                heroTitleBrand: "Dadman Institute",
                heroTitleSuffix: "!",
                heroDesc: "With the most experienced instructors, modern teaching methods and personalized planning, reach your language goals in the shortest possible time. From everyday conversation to international exams, we're with you.",
                heroFeature1: "Top Instructors in the Country",
                heroFeature2: "Conversation-Focused Method",
                heroFeature3: "Free Consultation & Level Test",
                formTitle: "Request a Free Consultation",
                formSubtitle: "Fill out the form below so our team can contact you",
                formErrorDefault: "There was a problem submitting the form. Please try again or contact us by phone.",
                formLabelName: "Full Name",
                formPlaceholderName: "e.g. Ali Rezaei",
                formLabelPhone: "Phone Number",
                formLabelType: "Request Type or Desired Course",
                formOption1: "Adult Conversation Courses",
                formOption2: "IELTS Exam Preparation",
                formOption3: "Kids & Teens Courses",
                formOption4: "General Consultation & Level Test",
                formLabelMessage: "Your Message or Details",
                formPlaceholderMessage: "(Required) Please write your message...",
                formSubmitBtn: "Submit Request to the Institute",
                benefitsKicker: "Why Dadman?",
                benefitsTitle: "Competitive Advantages of Dadman Language Institute",
                benefitsSubtitle: "We smooth your learning path by providing the best facilities",
                benefit1Title: "Outstanding, Experienced Instructors",
                benefit1Desc: "Instructors with internationally recognized teaching certificates and years of successful teaching experience.",
                benefit2Title: "100% Focus on Conversation",
                benefit2Desc: "Our teaching system is designed to strengthen listening and speaking skills from the very first session.",
                benefit3Title: "Flexible Scheduling",
                benefit3Desc: "Choose class times in the morning, evening, or on weekends to fit your schedule.",
                coursesKicker: "Programs",
                coursesTitle: "Dadman Course & Session Types",
                coursesSubtitle: "Specialized courses tailored to different ages, goals and levels of learners",
                course1Title: "Adult Conversation Sessions",
                course1Tag: "Guaranteed Speaking Fluency",
                course1Desc: "These sessions are held as interactive groups, focusing mainly on real everyday and work-life scenarios.",
                course1Li1: "12 sessions per month",
                course1Li2: "Limited class size (max 8 students)",
                course2Badge: "Most Popular",
                course2Title: "Specialized IELTS Courses",
                course2Tag: "For Immigration & Study Abroad",
                course2Desc: "Intensive specialized IELTS sessions with in-depth analysis of the four skills and standard mock exams.",
                course2Li1: "Personalized planning and support",
                course2Li2: "Target score guarantee with top instructors",
                course3Title: "Kids & Teens (Junior)",
                course3Tag: "Learning Through Games & Animation",
                course3Desc: "A modern teaching system for children that turns learning English into an enjoyable, lasting experience.",
                course3Li1: "Use of interactive platforms and games",
                course3Li2: "Building strong pronunciation & vocabulary foundations",
                courseBookBtn: "Book a Consultation",
                footerAbout: "A specialized reference for foreign language education using the world's leading methods and experienced instructors.",
                footerAddressTitle: "Institute Address",
                footerAddress: "Tehran, Moshirieh, Sazman-e Ab Street",
                footerContactTitle: "Contact Us",
                footerCopyright: "© All rights reserved for Dadman Language Institute.",
                successTitle: "Your Request Was Submitted Successfully!",
                gotItBtn: "Got It",
                comingSoonDesc: "This section will be available soon.",
                langModalTitle: "Choose Site Language",
                gamerModalTitle: "Gamer Themes",
                gamerModalDesc: "Pick one of the neon, glass-style themes below",
                gamerTheme1Desc: "Neon pink & cyan on dark glass",
                gamerTheme2Desc: "Hacker green on pure black",
                gamerTheme3Desc: "Fiery red & orange",
                gamerTheme4Desc: "Retro purple & pink",
                gamerTheme5Desc: "Shifting colors like RGB gaming gear",
                gamerResetOption: "Back to Normal Theme"
            },
            ar: {
                subnavStudents: "طلاب DTS",
                subnavMethod: "طريقة التدريس",
                subnavBooks: "الكتب التي ندرّسها",
                brandName: "معهد دادمان للغات",
                brandTagline: "تعليم متخصص للغات الأجنبية",
                navHome: "الرئيسية",
                navStudents: "طلاب DTS",
                navBenefits: "مزايا دادمان",
                navCourses: "الدورات والجلسات",
                navContact: "استشارة مجانية",
                navQuickSignup: "تسجيل سريع",
                heroBadge: "دعم حتى إتقان اللغة بالكامل",
                heroTitlePrefix: "ابنِ مستقبلك الدراسي والمهني مع",
                heroTitleBrand: "معهد دادمان",
                heroTitleSuffix: "!",
                heroDesc: "مع أكثر الأساتذة خبرة وأساليب تعليمية حديثة وتخطيط خاص، حقق هدفك اللغوي في أسرع وقت ممكن. من المحادثة اليومية إلى الاختبارات الدولية نحن معك.",
                heroFeature1: "أفضل الأساتذة في البلاد",
                heroFeature2: "منهج يركز على المحادثة",
                heroFeature3: "استشارة وتحديد مستوى مجاني",
                formTitle: "طلب استشارة مجانية",
                formSubtitle: "املأ النموذج أدناه ليتواصل معك خبراؤنا",
                formErrorDefault: "حدثت مشكلة أثناء إرسال النموذج. يرجى المحاولة مرة أخرى أو التواصل معنا هاتفياً.",
                formLabelName: "الاسم الكامل",
                formPlaceholderName: "مثال: علي رضائي",
                formLabelPhone: "رقم الهاتف",
                formLabelType: "نوع الطلب أو الدورة المطلوبة",
                formOption1: "دورات محادثة للكبار",
                formOption2: "إعداد اختبار الآيلتس (IELTS)",
                formOption3: "دورات الأطفال والمراهقين",
                formOption4: "استشارة عامة وتحديد مستوى",
                formLabelMessage: "رسالتك أو تفاصيل طلبك",
                formPlaceholderMessage: "(هذا الحقل إلزامي) يرجى كتابة رسالتك...",
                formSubmitBtn: "إرسال الطلب إلى المعهد",
                benefitsKicker: "لماذا دادمان؟",
                benefitsTitle: "المزايا التنافسية لمعهد دادمان للغات",
                benefitsSubtitle: "نُسهّل رحلة تعلمك من خلال توفير أفضل الإمكانيات",
                benefit1Title: "أساتذة متميزون وذوو خبرة",
                benefit1Desc: "الاستفادة من أساتذة حاصلين على شهادات تدريس دولية وسنوات من الخبرة الناجحة.",
                benefit2Title: "تركيز 100٪ على المحادثة",
                benefit2Desc: "نظامنا التعليمي مصمم لتعزيز مهارات الاستماع والتحدث منذ الجلسة الأولى.",
                benefit3Title: "مرونة في مواعيد الجلسات",
                benefit3Desc: "إمكانية اختيار مواعيد الجلسات صباحاً أو مساءً أو في عطلة نهاية الأسبوع بما يناسب وقتك.",
                coursesKicker: "البرامج التعليمية",
                coursesTitle: "أنواع جلسات ودورات معهد دادمان",
                coursesSubtitle: "دورات متخصصة تناسب مختلف الأعمار والأهداف والمستويات",
                course1Title: "جلسات محادثة للكبار",
                course1Tag: "ضمان الطلاقة في الكلام",
                course1Desc: "تُعقد هذه الجلسات بشكل جماعي وتفاعلي وتركز بشكل أساسي على سيناريوهات الحياة اليومية والعملية الواقعية.",
                course1Li1: "عدد الجلسات: 12 جلسة شهرياً",
                course1Li2: "سعة محدودة للفصول (8 أشخاص كحد أقصى)",
                course2Badge: "الأكثر رواجاً",
                course2Title: "دورات آيلتس المتخصصة (IELTS)",
                course2Tag: "خاص بالهجرة والدراسة",
                course2Desc: "جلسات مكثفة ومتخصصة في الآيلتس مع تحليل دقيق للمهارات الأربع واختبارات تجريبية معيارية (Mock).",
                course2Li1: "تخطيط ودعم مخصص",
                course2Li2: "ضمان الدرجة المستهدفة مع أساتذة بارزين",
                course3Title: "الأطفال والمراهقون (Junior)",
                course3Tag: "التعلم عبر الألعاب والرسوم المتحركة",
                course3Desc: "نظام تعليمي حديث مخصص للأطفال يحوّل تعلم اللغة الإنجليزية إلى تجربة ممتعة ودائمة.",
                course3Li1: "استخدام منصات تفاعلية وألعاب",
                course3Li2: "تعزيز أساسيات النطق والمفردات",
                courseBookBtn: "حجز استشارة",
                footerAbout: "مرجع متخصص لتعليم اللغات الأجنبية باستخدام أحدث الأساليب العالمية وأساتذة ذوي خبرة.",
                footerAddressTitle: "عنوان المعهد",
                footerAddress: "طهران، مشيرية، شارع سازمان آب",
                footerContactTitle: "تواصل معنا",
                footerCopyright: "© جميع الحقوق محفوظة لمعهد دادمان للغات.",
                successTitle: "تم إرسال طلبك بنجاح!",
                gotItBtn: "حسناً",
                comingSoonDesc: "سيتم تفعيل هذا القسم قريباً.",
                langModalTitle: "اختر لغة الموقع",
                gamerModalTitle: "تصاميم خاصة باللاعبين",
                gamerModalDesc: "اختر أحد التصاميم النيونية الزجاجية أدناه",
                gamerTheme1Desc: "وردي وسماوي نيون على زجاج داكن",
                gamerTheme2Desc: "أخضر هاكر على أسود خالص",
                gamerTheme3Desc: "أحمر وبرتقالي ناري",
                gamerTheme4Desc: "بنفسجي ووردي بأسلوب ريترو",
                gamerTheme5Desc: "ألوان متغيرة كأدوات الألعاب RGB",
                gamerResetOption: "العودة إلى الوضع العادي"
            },
            ko: {
                subnavStudents: "DTS 학생",
                subnavMethod: "교육 방식",
                subnavBooks: "저희가 가르치는 교재",
                brandName: "다드만 어학원",
                brandTagline: "전문 외국어 교육",
                navHome: "홈",
                navStudents: "DTS 학생",
                navBenefits: "다드만의 장점",
                navCourses: "과정 및 수업 종류",
                navContact: "무료 상담",
                navQuickSignup: "빠른 등록",
                heroBadge: "완전한 언어 숙달까지 지원합니다",
                heroTitlePrefix: "다드만 어학원과 함께",
                heroTitleBrand: "학업과 커리어의 미래를",
                heroTitleSuffix: "만드세요!",
                heroDesc: "가장 경험 많은 강사진, 현대적인 교육 방법과 맞춤형 커리큘럼으로 최단 시간 안에 목표를 달성하세요. 일상 회화부터 국제 시험까지 함께합니다.",
                heroFeature1: "국내 최고의 강사진",
                heroFeature2: "회화 중심 교육법",
                heroFeature3: "무료 상담 및 레벨 테스트",
                formTitle: "무료 상담 신청",
                formSubtitle: "아래 양식을 작성하시면 담당자가 연락드립니다",
                formErrorDefault: "양식 제출 중 문제가 발생했습니다. 다시 시도하시거나 전화로 문의해 주세요.",
                formLabelName: "성명",
                formPlaceholderName: "예: 홍길동",
                formLabelPhone: "전화번호",
                formLabelType: "신청 종류 또는 희망 과정",
                formOption1: "성인 회화 과정",
                formOption2: "아이엘츠(IELTS) 준비 과정",
                formOption3: "어린이·청소년 과정",
                formOption4: "일반 상담 및 레벨 테스트",
                formLabelMessage: "메시지 또는 문의 내용",
                formPlaceholderMessage: "(필수 입력) 문의 내용을 작성해 주세요...",
                formSubmitBtn: "신청서 제출하기",
                benefitsKicker: "왜 다드만인가?",
                benefitsTitle: "다드만 어학원의 경쟁력 있는 장점",
                benefitsSubtitle: "최고의 시설을 제공하여 학습 여정을 더 편안하게 만듭니다",
                benefit1Title: "우수하고 경험 많은 강사진",
                benefit1Desc: "국제 교육 자격증을 보유하고 다년간의 성공적인 교육 경력을 가진 강사진.",
                benefit2Title: "회화에 100% 집중",
                benefit2Desc: "첫 수업부터 듣기와 말하기 능력을 강화하도록 설계된 교육 시스템입니다.",
                benefit3Title: "유연한 수업 시간",
                benefit3Desc: "오전, 오후, 주말 등 원하는 시간에 맞춰 수업을 선택할 수 있습니다.",
                coursesKicker: "교육 프로그램",
                coursesTitle: "다드만의 다양한 수업 및 과정 종류",
                coursesSubtitle: "연령, 목표 및 수준에 맞는 전문 과정",
                course1Title: "성인 회화 수업",
                course1Tag: "말하기 유창성 보장",
                course1Desc: "이 수업은 그룹 상호작용 형식으로 진행되며 실제 일상 및 업무 시나리오에 중점을 둡니다.",
                course1Li1: "월 12회 수업",
                course1Li2: "제한된 인원 (최대 8명)",
                course2Badge: "인기 과정",
                course2Title: "아이엘츠(IELTS) 전문 과정",
                course2Tag: "이민 및 유학 전문",
                course2Desc: "네 가지 영역을 정밀하게 분석하는 집중 아이엘츠 수업과 표준 모의고사(Mock).",
                course2Li1: "맞춤형 계획 및 전담 지원",
                course2Li2: "우수 강사진과 함께하는 목표 점수 보장",
                course3Title: "어린이·청소년 (Junior)",
                course3Tag: "게임과 애니메이션을 통한 학습",
                course3Desc: "영어 학습을 즐겁고 오래 지속되는 경험으로 만드는 어린이 전용 최신 교육 시스템입니다.",
                course3Li1: "인터랙티브 플랫폼 및 게임 활용",
                course3Li2: "발음과 어휘의 기초 강화",
                courseBookBtn: "상담 예약",
                footerAbout: "세계 최고의 교육법과 경험 많은 강사진을 갖춘 전문 외국어 교육 기관입니다.",
                footerAddressTitle: "학원 주소",
                footerAddress: "테헤란, 모시리예, 사즈만 아브 거리",
                footerContactTitle: "문의하기",
                footerCopyright: "© 다드만 어학원. 모든 권리 보유.",
                successTitle: "신청이 성공적으로 접수되었습니다!",
                gotItBtn: "확인",
                comingSoonDesc: "이 섹션은 곧 제공될 예정입니다.",
                langModalTitle: "사이트 언어 선택",
                gamerModalTitle: "게이머 전용 테마",
                gamerModalDesc: "아래 네온 글래스 테마 중 하나를 선택하세요",
                gamerTheme1Desc: "어두운 글래스 위 네온 핑크·시안",
                gamerTheme2Desc: "순수 검정 위 해커 그린",
                gamerTheme3Desc: "불타는 듯한 빨강·주황",
                gamerTheme4Desc: "레트로 보라·핑크",
                gamerTheme5Desc: "RGB 게이밍 기기처럼 변하는 색상",
                gamerResetOption: "기본 테마로 돌아가기"
            },
            de: {
                subnavStudents: "DTS-Schüler",
                subnavMethod: "Unterrichtsmethode",
                subnavBooks: "Bücher, die wir unterrichten",
                brandName: "Dadman Sprachinstitut",
                brandTagline: "Spezialisierte Fremdsprachenausbildung",
                navHome: "Startseite",
                navStudents: "DTS-Schüler",
                navBenefits: "Vorteile von Dadman",
                navCourses: "Kurse & Sitzungen",
                navContact: "Kostenlose Beratung",
                navQuickSignup: "Schnellanmeldung",
                heroBadge: "Unterstützung bis zur vollständigen Sprachbeherrschung",
                heroTitlePrefix: "Gestalte deine akademische und berufliche Zukunft mit",
                heroTitleBrand: "Dadman Institut",
                heroTitleSuffix: "!",
                heroDesc: "Mit den erfahrensten Lehrkräften, modernen Unterrichtsmethoden und individueller Planung erreichst du dein Sprachziel in kürzester Zeit. Von Alltagsgesprächen bis zu internationalen Prüfungen sind wir an deiner Seite.",
                heroFeature1: "Top-Lehrkräfte des Landes",
                heroFeature2: "Konversationsorientierte Methode",
                heroFeature3: "Kostenlose Beratung & Einstufungstest",
                formTitle: "Kostenlose Beratung anfordern",
                formSubtitle: "Füllen Sie das Formular aus, damit unser Team Sie kontaktieren kann",
                formErrorDefault: "Beim Absenden des Formulars ist ein Problem aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns telefonisch.",
                formLabelName: "Vollständiger Name",
                formPlaceholderName: "z. B. Ali Rezaei",
                formLabelPhone: "Telefonnummer",
                formLabelType: "Anfrageart oder gewünschter Kurs",
                formOption1: "Konversationskurse für Erwachsene",
                formOption2: "IELTS-Prüfungsvorbereitung",
                formOption3: "Kurse für Kinder & Jugendliche",
                formOption4: "Allgemeine Beratung & Einstufungstest",
                formLabelMessage: "Ihre Nachricht oder Details",
                formPlaceholderMessage: "(Pflichtfeld) Bitte schreiben Sie Ihre Nachricht...",
                formSubmitBtn: "Anfrage an das Institut senden",
                benefitsKicker: "Warum Dadman?",
                benefitsTitle: "Wettbewerbsvorteile des Dadman Sprachinstituts",
                benefitsSubtitle: "Wir erleichtern Ihren Lernweg mit den besten Möglichkeiten",
                benefit1Title: "Herausragende, erfahrene Lehrkräfte",
                benefit1Desc: "Lehrkräfte mit international anerkannten Lehrzertifikaten und jahrelanger erfolgreicher Unterrichtserfahrung.",
                benefit2Title: "100% Fokus auf Konversation",
                benefit2Desc: "Unser Unterrichtssystem stärkt Hör- und Sprechfertigkeiten bereits ab der ersten Sitzung.",
                benefit3Title: "Flexible Terminplanung",
                benefit3Desc: "Wählen Sie Unterrichtszeiten am Morgen, Abend oder am Wochenende passend zu Ihrem Zeitplan.",
                coursesKicker: "Bildungsprogramme",
                coursesTitle: "Kurs- und Sitzungsarten von Dadman",
                coursesSubtitle: "Spezialisierte Kurse für verschiedene Altersgruppen, Ziele und Niveaus",
                course1Title: "Konversationskurse für Erwachsene",
                course1Tag: "Garantierte Sprechflüssigkeit",
                course1Desc: "Diese Sitzungen finden in interaktiven Gruppen statt und konzentrieren sich hauptsächlich auf reale Alltags- und Arbeitsszenarien.",
                course1Li1: "12 Sitzungen pro Monat",
                course1Li2: "Begrenzte Klassengröße (max. 8 Personen)",
                course2Badge: "Am beliebtesten",
                course2Title: "Spezialisierte IELTS-Kurse",
                course2Tag: "Für Auswanderung & Studium",
                course2Desc: "Intensive, spezialisierte IELTS-Sitzungen mit detaillierter Analyse der vier Fertigkeiten und standardisierten Mock-Prüfungen.",
                course2Li1: "Individuelle Planung und Betreuung",
                course2Li2: "Zielnoten-Garantie mit Top-Lehrkräften",
                course3Title: "Kinder & Jugendliche (Junior)",
                course3Tag: "Lernen durch Spiele & Animation",
                course3Desc: "Ein modernes Unterrichtssystem für Kinder, das Englischlernen zu einem angenehmen und nachhaltigen Erlebnis macht.",
                course3Li1: "Nutzung interaktiver Plattformen und Spiele",
                course3Li2: "Stärkung der Grundlagen von Aussprache & Wortschatz",
                courseBookBtn: "Beratung buchen",
                footerAbout: "Eine spezialisierte Referenz für Fremdsprachenausbildung mit den weltweit führenden Methoden und erfahrenen Lehrkräften.",
                footerAddressTitle: "Institutsadresse",
                footerAddress: "Teheran, Moshirieh, Sazman-e Ab Straße",
                footerContactTitle: "Kontaktieren Sie uns",
                footerCopyright: "© Alle Rechte vorbehalten für das Dadman Sprachinstitut.",
                successTitle: "Ihre Anfrage wurde erfolgreich übermittelt!",
                gotItBtn: "Verstanden",
                comingSoonDesc: "Dieser Bereich wird bald verfügbar sein.",
                langModalTitle: "Sprache der Website wählen",
                gamerModalTitle: "Gamer-Themes",
                gamerModalDesc: "Wählen Sie eines der Neon-Glas-Themes unten",
                gamerTheme1Desc: "Neon-Pink & Cyan auf dunklem Glas",
                gamerTheme2Desc: "Hacker-Grün auf reinem Schwarz",
                gamerTheme3Desc: "Feuriges Rot & Orange",
                gamerTheme4Desc: "Retro Lila & Pink",
                gamerTheme5Desc: "Wechselnde Farben wie bei RGB-Gaming-Hardware",
                gamerResetOption: "Zurück zum normalen Theme"
            }
        };

        const rtlLangs = ['fa', 'ar'];

        function applyTranslations(lang) {
            const dict = translations[lang] || translations.fa;
            document.querySelectorAll('[data-i18n]').forEach(function (el) {
                const key = el.getAttribute('data-i18n');
                if (dict[key] !== undefined) {
                    el.textContent = dict[key];
                }
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
                const key = el.getAttribute('data-i18n-placeholder');
                if (dict[key] !== undefined) {
                    el.setAttribute('placeholder', dict[key]);
                }
            });

            document.documentElement.setAttribute('lang', lang);
            document.documentElement.setAttribute('dir', rtlLangs.includes(lang) ? 'rtl' : 'ltr');

            document.querySelectorAll('.lang-option').forEach(function (btn) {
                btn.classList.toggle('lang-active', btn.getAttribute('data-lang') === lang);
            });
        }

        function switchLanguage(lang) {
            applyTranslations(lang);
            try { localStorage.siteLang = lang; } catch (e) {}
            closeLanguageModal();
        }

        function openLanguageModal() {
            const modal = document.getElementById('languageModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeLanguageModal() {
            const modal = document.getElementById('languageModal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }

        document.getElementById('languageModal').addEventListener('click', function (event) {
            if (event.target === this) {
                closeLanguageModal();
            }
        });

        function openPanelModal() {
            const modal = document.getElementById('panelModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closePanelModal() {
            const modal = document.getElementById('panelModal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }

        document.getElementById('panelModal').addEventListener('click', function (event) {
            if (event.target === this) {
                closePanelModal();
            }
        });

        (function initLanguage() {
            let savedLang = 'fa';
            try {
                if (localStorage.siteLang && translations[localStorage.siteLang]) {
                    savedLang = localStorage.siteLang;
                }
            } catch (e) {}
            applyTranslations(savedLang);
        })();

        /* ===================== سیستم تم‌های گیمری ===================== */
        const gamerThemes = ['cyberpunk', 'matrix', 'inferno', 'synthwave', 'rgb'];

        function openGamerModal() {
            const modal = document.getElementById('gamerThemeModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeGamerModal() {
            const modal = document.getElementById('gamerThemeModal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }

        function updateGamerActiveState() {
            const current = document.documentElement.getAttribute('data-gamer-theme') || 'none';
            document.querySelectorAll('.gamer-option').forEach(function (btn) {
                btn.classList.toggle('lang-active', btn.getAttribute('data-gamer') === current);
            });
        }

        function applyGamerTheme(theme) {
            if (theme === 'none' || !gamerThemes.includes(theme)) {
                document.documentElement.removeAttribute('data-gamer-theme');
            } else {
                document.documentElement.setAttribute('data-gamer-theme', theme);
            }
            try { localStorage.gamerTheme = theme; } catch (e) {}
            updateGamerActiveState();
            closeGamerModal();
        }

        document.getElementById('gamerThemeModal').addEventListener('click', function (event) {
            if (event.target === this) {
                closeGamerModal();
            }
        });

        (function initGamerTheme() {
            let savedTheme = 'none';
            try {
                if (localStorage.gamerTheme && (gamerThemes.includes(localStorage.gamerTheme) || localStorage.gamerTheme === 'none')) {
                    savedTheme = localStorage.gamerTheme;
                }
            } catch (e) {}
            if (savedTheme !== 'none') {
                document.documentElement.setAttribute('data-gamer-theme', savedTheme);
            }
            updateGamerActiveState();
        })();
