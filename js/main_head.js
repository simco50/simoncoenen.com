
var isDarkTheme = localStorage.getItem('theme') != 'light';
document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');