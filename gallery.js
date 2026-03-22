document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('gallery-modal');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = document.querySelector('.close');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');

  let currentGallery = [];
  let currentIndex = 0;

  document.querySelectorAll('.teaching-gallery a').forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const gallery = link.closest('.teaching-gallery');
      currentGallery = Array.from(gallery.querySelectorAll('a')).map(a => a.href);
      currentIndex = currentGallery.indexOf(link.href);
      showModal();
    });
  });

  function showModal() {
    modal.style.display = 'flex';
    modalImg.src = currentGallery[currentIndex];
  }

  closeBtn.onclick = () => modal.style.display = 'none';

  prevBtn.onclick = () => {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : currentGallery.length - 1;
    modalImg.src = currentGallery[currentIndex];
  };

  nextBtn.onclick = () => {
    currentIndex = (currentIndex < currentGallery.length - 1) ? currentIndex + 1 : 0;
    modalImg.src = currentGallery[currentIndex];
  };

  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
});