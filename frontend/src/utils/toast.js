export function showToast(message, type = 'success', timeout = 4000) {
  const containerId = 'app-toasts';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.right = '20px';
    container.style.top = '20px';
    container.style.zIndex = 9999;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.margin = '6px 0';
  toast.style.padding = '10px 14px';
  toast.style.borderRadius = '6px';
  toast.style.color = '#fff';
  toast.style.minWidth = '200px';
  toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  toast.style.transform = 'translateY(-6px)';

  if (type === 'error') {
    toast.style.background = '#e74c3c';
  } else if (type === 'info') {
    toast.style.background = '#3498db';
  } else {
    toast.style.background = '#2ecc71';
  }

  container.appendChild(toast);

  // show
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-6px)';
    setTimeout(() => container.removeChild(toast), 200);
  }, timeout);
}
