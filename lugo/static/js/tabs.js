const tabs = document.querySelectorAll(".tab")
  
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const details = tab.parentElement.children
        for (let i = 0; i < details.length; i++) {
            if (details[i] !== tab) {
                details[i].removeAttribute("open");
            }
        }
    })
})
