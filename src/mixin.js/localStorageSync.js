export default {
  data() {
    return {
      _lsUnwatch: null
    }
  },

  methods: {
    startLocalStorageSync(key,stateName,defaultValue = []) {
      const saved = localStorage.getItem(key)
      if(saved) {
        try {this[stateName] = JSON.parse(saved)}
        catch {this[stateName] = defaultValue}
      } else {
        this[stateName] = defaultValue
      }

      if(this._lsUnwatch) this._lsUnwatch()
      this._lsUnwatch = this.$watch(
        stateName,
        (val) => {
          localStorage.setItem(key, JSON.stringify(val))
        },
        { deep: true }
      )
    },

    beforeUnmount() {
      if(this._lsUnwatch) this._lsUnwatch()
    },
  }
}