(function attachShareHelpers() {
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copied) {
      throw new Error("클립보드에 복사하지 못했습니다.");
    }
  }

  async function share({ title, text, url }) {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }

    await copyText([text, url].filter(Boolean).join("\n"));
  }

  async function shareToKakao({ title, text, url }) {
    await share({ title, text, url });
  }

  async function shareToSms({ text, url }) {
    const body = encodeURIComponent([text, url].filter(Boolean).join("\n"));
    window.location.href = `sms:?&body=${body}`;
  }

  async function shareToInstagram({ text, url }) {
    await copyText([text, url].filter(Boolean).join("\n"));

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = "instagram://camera";
      return;
    }

    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  window.ResultShare = {
    copyText,
    share,
    shareToKakao,
    shareToSms,
    shareToInstagram,
  };
})();
