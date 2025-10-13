import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Aychookah ile iletişime geçin. Lüks nargile takımları ve Rus nargile ekipmanları hakkında bilgi almak için bize ulaşın.",
  keywords: ["nargile iletişim", "nargile satış", "nargile sipariş", "aychookah iletişim"],
};

const ContactPage: React.FC = () => {
  return (
    <>
      <ContactHero />
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;

