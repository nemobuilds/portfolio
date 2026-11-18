// Inline script for index.html <head>. Keep in sync with getInitialTheme in ThemeProvider.
export const themeScript = `(function(){try{var t=null;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})();`
