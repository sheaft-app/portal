/** Dispatch event on click outside of node */
export const clickOutside = (node, triggerElement) => {
  
    const handleClick = event => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        if (triggerElement.contains(event.target)) {
          event.stopPropagation();
        }

        node.dispatchEvent(
          new CustomEvent('click_outside', node)
        )
      }
    }
  
    document.addEventListener('click', handleClick, true);
    
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    }
}