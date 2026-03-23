document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('gallery-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const closeBtn = document.querySelector('.close');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');

  let currentGallery = [];
  let currentIndex = 0;

  document.querySelectorAll('.teaching-gallery a').forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const gallery = link.closest('.teaching-gallery');
      currentGallery = Array.from(gallery.querySelectorAll('a')).map(a => ({
        src: a.href,
        alt: a.querySelector('img') ? a.querySelector('img').alt : ''
      }));
      currentIndex = currentGallery.findIndex(item => item.src === link.href);
      showModal();
    });
  });

  function showModal() {
    modal.style.display = 'flex';
    modalImg.src = currentGallery[currentIndex].src;
    modalCaption.textContent = currentGallery[currentIndex].alt;
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  function showPrev() {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : currentGallery.length - 1;
    modalImg.src = currentGallery[currentIndex].src;
    modalCaption.textContent = currentGallery[currentIndex].alt;
  }

  function showNext() {
    currentIndex = (currentIndex < currentGallery.length - 1) ? currentIndex + 1 : 0;
    modalImg.src = currentGallery[currentIndex].src;
    modalCaption.textContent = currentGallery[currentIndex].alt;
  }

  closeBtn.onclick = closeModal;
  prevBtn.onclick = showPrev;
  nextBtn.onclick = showNext;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'Escape') closeModal();
    }
  });
});