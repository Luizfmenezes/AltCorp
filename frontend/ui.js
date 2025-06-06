export function showScreen(screenToShow, screenToHide) {
    screenToHide.classList.remove('active');
    screenToHide.classList.add('hidden');
    screenToShow.classList.remove('hidden');
    screenToShow.classList.add('active');
}

export function updateSidebarSelection(screenKey) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-nav a[data-screen-key="${screenKey}"]`);
    if (activeLink) activeLink.classList.add('active');
}

export function toggleMobileDrawer() {
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    mobileDrawer.classList.toggle('active');
    drawerOverlay.classList.toggle('active');
    drawerOverlay.classList.toggle('hidden');
}
