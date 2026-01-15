<!-- 削除ダイアログ -->
<template>
  <v-dialog :model-value="modelValue" @update:model-value="emitUpdate" max-width="420">
    <v-card elevation="4" rounded="lg" class="confirmCard">
      <v-card-text>
        {{ message }}
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" @click="$emit('cancel')">キャンセル</v-btn>
        <v-btn color="red" variant="flat" @click="$emit('confirm')">はい</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmDeleteDialogView",
  props: {
    modelValue: { type: Boolean, required: true},
    message: { type: String, required: true}
  },
  emits: ["update:modelValue", "cancel", "confirm"],
  methods: {
    emitUpdate(val) {
      this.$emit("update:modelValue", val)
    }
  }
}
</script>