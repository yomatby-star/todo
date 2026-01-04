<template>
  <v-container class="py-4">
    <!-- メモ追加本体 -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-3" elevation="2">
          <!-- タイトルとメモ新規追加 -->
          <div class="d-flex aline-center justify-space-between">
            <div class="text-h6">メモ</div>
            <v-btn icon="mdi-plus" variant="text" @click="createMemo()" />
          </div>

          <v-divider class="my-2"></v-divider>

          <!-- 既存メモ描画 -->
          <v-list v-if="memos.length > 0">
            <v-list-item
              v-for="m in memos"
              :key="m.id"
              :active="m.id === selectedId"
              @click="selectMemo(m.id)"
            >
              <v-list-item-title class="font-weight-medium">
                {{ m.title || "新規メモ"}}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(m.updatedAt) }}
              </v-list-item-subtitle>

              <!-- 削除ボタン -->
              <template #append>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  @click.stop="removeMemo(m.id)"
                />
              </template>

            </v-list-item>
          </v-list>
          <div v-else class="text-medium-emphasis py-6 text-center">メモを追加してね</div>
        </v-card>
      </v-col>

      <!-- メモ詳細画面 -->
      <v-col cols="12" md="8">
        <v-card class="pa-3" elevation="2" min-height="420">
          <div v-if="currentMemo">
            <div class="text-caption text-medium-emphasis mb-2">
              最終更新: {{ formatDate(currentMemo.updatedAt) }}
            </div>
            <v-textarea
              v-model="currentMemo.body"
              placeholder="メモを記入..."
              variant="outlined"
              auto-grow
              rows="12"
              @input="touchCurrentMemo"
            />
          </div>
          <div v-else class="text-medium-emphasis py-12 text-center">
            左の「＋」でメモを作成するか、一覧から選んでください
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: "memo",
  data () {
    return {
      memos: [],
      selectedId: null
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
        return globalThis.crypto.randomUUID();
      }
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    },

    // 後で共通関数に移行する予定
    formatDate(ts) {
      if (!ts) return "";
      const d = new Date(ts);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
    },

    createMemo() {
      const date = Date.now()
      const id = this.makeId()
      console.log("id", id)
      const memo = {
        id,
        title: "新規メモ",
        body: "",
        updatedAt: date
      }
      console.log("memo", memo)
      this.memos.unshift(memo)
      this.selectedId = id
    },

    selectMemo(id) {
      this.selectedId = id
      console.log("selectedId:", this.selectedId)
    },

    removeMemo(targetId) {
      this.memos = this.memos.filter((m) => m.id !== targetId)
    },

    touchCurrentMemo() {
      if (!this.currentMemo) return
      const date = Date.now() 
      this.currentMemo.updatedAt = date

      const firstLine = (this.currentMemo.body || "").split("\n")[0].trim()
      this.currentMemo.title = firstLine || "新規メモ"
      this.memos.sort((a,b) => b.updatedAt - a.updatedAt)
    }
  }
}
</script>



