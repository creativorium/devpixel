import { site } from "@/lib/site";
export function WhatsAppButton() {
  const valid = /^[1-9]\d{7,14}$/.test(site.whatsappNumber);
  const icon = (
    <svg
      aria-hidden="true"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M21 11.5a9 9 0 0 1-13.3 7.9L3 21l1.6-4.7A9 9 0 1 1 21 11.5Z" />
      <path d="M8 7c-.8 1-.2 3 1.6 4.9s3.9 2.7 5.3 1.9l.8-1.4-2.5-1.2-.9.9c-1.2-.6-2.1-1.5-2.6-2.7l.8-.8L9.4 6.4Z" />
    </svg>
  );
  return (
    <div className="whatsapp-contact">
      {valid ? (
        <a
          className="button"
          href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hi DevnPixel, I would like to discuss a project.")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {icon} Chat on WhatsApp ↗
        </a>
      ) : (
        <>
          <button className="button" disabled>
            {icon} WhatsApp
          </button>
          <span>WhatsApp enquiries coming soon.</span>
        </>
      )}
    </div>
  );
}
