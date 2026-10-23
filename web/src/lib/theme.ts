/** localStorage key that holds the visitor's theme choice ("light" | "dark"). */
export const THEME_KEY = "gai-theme";

/** Runs in <head> before first paint so a saved choice never flashes the other theme. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
