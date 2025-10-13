"use client";

import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      // Here you would typically send the form data to your backend
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }
  };

  return (
    <div>
      <h2 className="font-sans text-3xl font-bold text-luxury-black mb-6">
        Mesaj Gönderin
      </h2>
      <p className="text-gray-600 mb-8">
        Formu doldurarak bize ulaşabilirsiniz. En kısa sürede size dönüş yapacağız.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Ad Soyad *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-luxury-black focus:border-transparent transition-all"
            placeholder="Adınız ve soyadınız"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            E-posta *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-luxury-black focus:border-transparent transition-all"
            placeholder="ornek@email.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-luxury-black focus:border-transparent transition-all"
            placeholder="+90 5XX XXX XX XX"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
            Konu *
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-luxury-black focus:border-transparent transition-all"
          >
            <option value="">Konu seçiniz</option>
            <option value="product-inquiry">Ürün Bilgisi</option>
            <option value="custom-order">Özel Sipariş</option>
            <option value="collaboration">İşbirliği</option>
            <option value="support">Destek</option>
            <option value="other">Diğer</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
            Mesajınız *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-luxury-black focus:border-transparent transition-all resize-none"
            placeholder="Mesajınızı buraya yazın..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-8 py-4 bg-luxury-black text-white font-semibold rounded-sm hover:bg-luxury-darkGray transition-all duration-300 uppercase tracking-wider text-sm ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Gönderiliyor..." : "Mesaj Gönder"}
        </button>

        {/* Status Messages */}
        {submitStatus === "success" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-sm">
            <p className="text-green-800 text-sm">
              ✓ Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
            </p>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-sm">
            <p className="text-red-800 text-sm">
              ✗ Bir hata oluştu. Lütfen daha sonra tekrar deneyin.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactForm;

