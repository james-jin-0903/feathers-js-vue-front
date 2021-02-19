export default {
  data: {
    parent: window,
    parentIsWin: true,
    boundary: null,
    delay: 0,
    offset: 0,
    enable: true,
    default: {
      position: '',
      top: '',
      left: '',
      width: '',
      height: ''
    }
  },
  handleScroll() {
    const scrollTop = this.def.data.parentIsWin ? window.pageYOffset : this.def.data.parent.scrollTop
    const parentTop = this.def.data.parentIsWin ? 0 : this.def.data.parent.getBoundingClientRect().top
    const defaultTop = this.def.data.default.top
    const defaultHeight = this.def.data.default.height
    const offset = this.def.data.offset

    this.def.setEnable(this.value)
    this.def.setDefault(this.el, true)

    if (scrollTop + parentTop + offset >= defaultTop && this.def.data.enable) {
      this.el.classList.add("affix")
      this.el.style.position = 'fixed'
      this.el.style.top = parentTop + offset + 'px'
      this.el.style.left = this.def.data.default.left + 'px'
      this.el.style.width = this.def.data.default.width + 'px'
      this.el.style.height = this.def.data.default.height + 'px'

      if (this.def.data.boundary) {
        const boundaryRect = this.def.data.boundary.getBoundingClientRect()

        if (boundaryRect.height + boundaryRect.y - parentTop - offset <= defaultHeight) {
          this.el.style.position = 'absolute'
          this.el.style.top = boundaryRect.height - defaultHeight + 'px'
          this.el.style.left = '0px'
          this.el.classList.add("inbound")
        } else {
          this.el.classList.remove("inbound")
        }
      }

    } else {
      this.el.classList.remove("affix")
      this.el.style.position = ''
      this.el.style.top = null
      this.el.style.left = null
      this.el.style.width = null
      this.el.style.height = null
    }
  },
  setDefault(el, update) {
    if (update) {
      this.data.default.left = el.style.left || el.getBoundingClientRect().left
      this.data.default.width = el.style.width || el.getBoundingClientRect().width
    } else {
      this.data.default = {
        position: el.style.position,
        top: el.style.top || el.getBoundingClientRect().top,
        left: el.style.left || el.getBoundingClientRect().left,
        width: el.style.width || el.getBoundingClientRect().width,
        height: el.style.height || el.getBoundingClientRect().height
      }
    }
  },
  setEnable(value) {
    this.data.enable = value.enable()
  },
  inserted(el, binding, vnode) {
    if (binding.value.delay) {
      binding.def.data.delay = binding.value.delay
    }
    if (binding.value.offset) {
      binding.def.data.offset = binding.value.offset
    }
    if (binding.value.boundaryid) {
      binding.def.data.boundary = window.document.getElementById(binding.value.boundaryid)
    }
    if (binding.value.parentid) {
      binding.def.data.parent = window.document.getElementById(binding.value.parentid)
      binding.def.data.parentIsWin = false
    }

    setTimeout(() => {
      binding.def.setEnable(binding.value)
      binding.def.setDefault(el)

      binding.def.data.parent.addEventListener('scroll', binding.def.handleScroll.bind({
        el,
        def: binding.def,
        value: binding.value
      }));
      binding.def.data.parent.addEventListener('resize', binding.def.handleScroll.bind({
        el,
        def: binding.def,
        value: binding.value
      }));

    }, binding.def.data.delay)
  },
  unbind(el, binding, vnode) {
    binding.def.data.parent.removeEventListener('scroll', binding.def.handleScroll.bind({
      el,
      def: binding.def,
      value: binding.value
    }));
    binding.def.data.parent.removeEventListener('resize', binding.def.handleScroll.bind({
      el,
      def: binding.def,
      value: binding.value
    }));
  }
}