// 単一削除
// 単一削除キャンセル

export default {
  methods: {
    // ダイアログOPEN
    openDeleteDialog (val, deletingKey, dialogKey) {
      this[deletingKey] = val
      this[dialogKey] = true
    },

    // キャンセル関係
    cancelDelete (deletingKey, dialogKey) {
      this[deletingKey] = null
      this[dialogKey] = false
    },

    // 削除関係
    confirmDelete (listKey, deletingKey, dialogKey) {
      const target = this[deletingKey]
      console.log('listKey:', listKey , 'deletingKey:', deletingKey, 'dialogKey:', dialogKey)
      console.log(this[listKey])
      console.log(target)
      if(!Array.isArray(this[listKey])) return
      console.log('STOP NO ARRAY')
      if(!target?.id) return
      console.log('STOP NO ID')
      this[listKey] = this[listKey].filter(x => x.id !== target.id)
      console.log("削除")
      this.cancelDelete (deletingKey, dialogKey)
    },
  }
}