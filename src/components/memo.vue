<template>
  <v-container class="py-4">
    <v-row>
      <!-- 左：メモ一覧 -->
      <v-col cols="12" md="4">
        <v-card class="pa-3" elevation="2" rounded="xl">
          <div class="d-flex align-center justify-space-between">
            <div class="text-h6">メモ</div>

            <!-- ＋で新規作成 → ダイアログを開く -->
            <v-btn icon variant="text" @click="createMemoAndOpen()">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>

          <v-divider class="my-2" />

          <v-list v-if="memos.length > 0">
            <v-list-item
              v-for="m in memos"
              :key="m.id"
              :active="m.id === selectedId"
              @click="openMemo(m.id)"
            >
              <v-list-item-title class="font-weight-medium">
                {{ m.title || "新規メモ" }}
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ formatDate(m.updatedAt) }}
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  icon
                  variant="text"
                  @click.stop="removeMemo(m.id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <div v-else class="text-medium-emphasis py-6 text-center">
            メモを追加してね
          </div>
        </v-card>
      </v-col>

      
    </v-row>

    <!-- 編集ダイアログ -->
    <v-dialog
      v-model="editorOpen"
      scrollable
      width="92vw"
      max-width="720"
    >
      <v-card class="editorCard" rounded="xl" elevation="14">
        <v-toolbar density="compact" class="editorToolbar">
          <v-btn icon @click="closeEditor()" aria-label="戻る">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>

          <v-toolbar-title class="text-subtitle-1">
            {{ currentMemo?.title || "メモ" }}
          </v-toolbar-title>

          <v-spacer />

          <v-btn
            v-if="currentMemo"
            icon
            variant="text"
            @click="removeMemo(currentMemo.id); closeEditor()"
            aria-label="削除"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pt-4">
          <div v-if="currentMemo">
            <div class="text-caption text-medium-emphasis mb-2">
              最終更新: {{ formatDate(currentMemo.updatedAt) }}
            </div>

            <v-textarea
              v-model="currentMemo.body"
              placeholder="メモを記入..."
              variant="outlined"
              auto-grow
              rows="10"
              @input="touchCurrentMemo"
            />
          </div>

          <div v-else class="text-medium-emphasis py-12 text-center">
            メモが選択されていません
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
export default {
  name: "memo",
  data () {
    return {
      memos: [],
      selectedId: null,

      // ダイアログの開閉
      editorOpen: false,
    }
  },

  mounted() {
    const saved = localStorage.getItem("memos_v1")
    this.memos = saved ? JSON.parse(saved) : []
  },

  watch: {
    memos: {
      deep: true,
      handler(newValue) {
        localStorage.setItem("memos_v1", JSON.stringify(newValue))
      }
    }
  },

  computed: {
    currentMemo() {
      return this.memos.find((m) => m.id === this.selectedId) || null
    }
  },

  methods: {
    makeId() {
      if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
        return globalThis.crypto.randomUUID()
      }
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`
    },

    formatDate(ts) {
      if (!ts) return ""
      const d = new Date(ts)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      const hh = String(d.getHours()).padStart(2, "0")
      const mi = String(d.getMinutes()).padStart(2, "0")
      return `${yyyy}/${mm}/${dd} ${hh}:${mi}`
    },

    // ＋：新規作成して即編集を開く
    createMemoAndOpen() {
      const date = Date.now()
      const id = this.makeId()
      const memo = {
        id,
        title: "新規メモ",
        body: "",
        updatedAt: date
      }
      this.memos.unshift(memo)
      this.selectedId = id
      this.editorOpen = true
    },

    // 一覧クリック：選択して編集を開く
    openMemo(id) {
      this.selectedId = id
      this.editorOpen = true
    },

    closeEditor() {
      this.editorOpen = false
      // 「一覧に戻る」イメージなら選択を残す/消すは好み
    },

    removeMemo(targetId) {
      this.memos = this.memos.filter((m) => m.id !== targetId)

      // 削除対象が今開いてるメモなら選択も解除
      if (this.selectedId === targetId) {
        this.selectedId = null
      }
    },

    touchCurrentMemo() {
      if (!this.currentMemo) return

      const date = Date.now()
      this.currentMemo.updatedAt = date

      const firstLine = (this.currentMemo.body || "").split("\n")[0].trim()
      this.currentMemo.title = firstLine || "新規メモ"

      // 更新が新しい順に
      this.memos.sort((a, b) => b.updatedAt - a.updatedAt)
    }
  }
}
</script>
