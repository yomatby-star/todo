<template>
  <v-app theme="dark" class="appShell">
    <v-main>
      <v-container class="mainContainer">
        <!-- ===== Header ===== -->
        <header class="header">
          <div class="brand">
            <div class="brandTitle">MEMO</div>
          </div>

          <div class="headerActions">
            <v-chip class="chip" variant="tonal" size="small">
              {{ memos.length }} 件
            </v-chip>

            <v-btn
              class="addBtn"
              rounded="xl"
              size="small"
              @click="createMemo()"
            >
              <v-icon size="18" class="mr-1">mdi-plus</v-icon>
              新規
            </v-btn>
          </div>
        </header>

        <v-row class="layoutRow">
          <!-- ===== Left: List ===== -->
          <v-col cols="12" md="4">
            <v-card class="panel" rounded="xl" elevation="0">
              <div class="panelHead">
                <div class="panelTitle">
                  <v-icon size="18" class="mr-2">mdi-notebook-outline</v-icon>
                  メモ一覧
                </div>

                <v-text-field
                  v-model="query"
                  class="searchField"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  placeholder="検索…"
                  clearable
                >
                  <template #prepend-inner>
                    <v-icon size="18" class="fieldIcon">mdi-magnify</v-icon>
                  </template>
                </v-text-field>
              </div>

              <v-divider class="divider" />

              <div v-if="filteredMemos.length === 0" class="emptyState">
                <v-icon size="22">mdi-weather-night</v-icon>
                <div class="emptyTitle">メモがありません</div>
                <div class="emptySub">右上の「新規」から作成できます</div>
              </div>

              <v-list v-else class="memoList">
                <v-list-item
                  v-for="m in filteredMemos"
                  :key="m.id"
                  class="memoItem"
                  rounded="lg"
                  :active="m.id === selectedId"
                  @click="selectMemo(m.id)"
                >
                  <v-list-item-title class="memoTitle">
                    {{ m.title || "新規メモ" }}
                  </v-list-item-title>

                  <v-list-item-subtitle class="memoMeta">
                    <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
                    {{ formatDate(m.updatedAt) }}
                  </v-list-item-subtitle>

                  <template #append>
                    <v-btn
                      icon
                      class="iconBtn danger"
                      variant="text"
                      @click.stop="removeMemo(m.id)"
                      aria-label="削除"
                    >
                      <v-icon>mdi-trash-can-outline</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <!-- ===== Right: Editor ===== -->
          <v-col cols="12" md="8">
            <v-card class="panel editorPanel" rounded="xl" elevation="0" min-height="520">
              <div v-if="currentMemo" class="editor">
                <div class="editorTop">
                  <div class="updated">
                    <v-icon size="16" class="mr-1">mdi-calendar-clock</v-icon>
                    最終更新: {{ formatDate(currentMemo.updatedAt) }}
                  </div>

                  <div class="editorActions">
                    <v-btn
                      class="ghostBtn"
                      variant="text"
                      size="small"
                      @click="copyCurrent"
                    >
                      <v-icon size="18">mdi-content-copy</v-icon>
                      コピー
                    </v-btn>

                    <v-btn
                      class="ghostBtn dangerText"
                      variant="text"
                      size="small"
                      @click="removeMemo(currentMemo.id)"
                    >
                      <v-icon size="18">mdi-trash-can-outline</v-icon>
                      削除
                    </v-btn>
                  </div>
                </div>

                <!-- タイトルは「本文1行目自動」なので表示だけ薄く -->
                <div class="titlePreview">
                  {{ currentMemo.title || "新規メモ" }}
                </div>

                <v-textarea
                  v-model="currentMemo.body"
                  class="editorArea"
                  placeholder="メモを記入..."
                  variant="outlined"
                  auto-grow
                  rows="12"
                  @input="touchCurrentMemo"
                />
              </div>

              <div v-else class="emptyEditor">
                <v-icon size="26">mdi-note-plus-outline</v-icon>
                <div class="emptyTitle">メモを選択してください</div>
                <div class="emptySub">左の一覧から選ぶか「新規」で作成できます</div>

                <v-btn class="addBtn mt-5" rounded="xl" @click="createMemo()">
                  <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                  新規メモを作成
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        
        <v-card class="composerHint" rounded="xl" elevation="0">
          <div class="hintRow">
            <v-icon size="18" class="mr-2">mdi-lightbulb-outline</v-icon>
            1行目が自動でタイトルになります。検索も使えます。
          </div>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "memo",

  data() {
    return {
      memos: [],
      selectedId: null,
      query: "",
    }
  },

  mounted() {
    const saved = localStorage.getItem("memos_v1")
    this.memos = saved ? JSON.parse(saved) : []

    // 起動時に1件目を自動選択
    if (this.memos.length > 0) {
      this.selectedId = this.memos[0].id
    }
  },

  watch: {
    memos: {
      deep: true,
      handler(newValue) {
        localStorage.setItem("memos_v1", JSON.stringify(newValue))
      },
    },
  },

  computed: {
    currentMemo() {
      return this.memos.find((m) => m.id === this.selectedId) || null
    },

    // 検索結果（タイトル＋本文で検索）
    filteredMemos() {
      const q = this.query.trim().toLowerCase()
      if (!q) return this.memos
      return this.memos.filter((m) => {
        const t = (m.title || "").toLowerCase()
        const b = (m.body || "").toLowerCase()
        return t.includes(q) || b.includes(q)
      })
    },
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

    createMemo() {
      const date = Date.now()
      const id = this.makeId()
      const memo = {
        id,
        title: "新規メモ",
        body: "",
        updatedAt: date,
      }
      this.memos.unshift(memo)
      this.selectedId = id
      this.query = ""
    },

    selectMemo(id) {
      this.selectedId = id
    },

    removeMemo(targetId) {
      const wasSelected = this.selectedId === targetId
      this.memos = this.memos.filter((m) => m.id !== targetId)

      if (wasSelected) {
        this.selectedId = this.memos.length > 0 ? this.memos[0].id : null
      }
    },

    touchCurrentMemo() {
      if (!this.currentMemo) return

      const date = Date.now()
      this.currentMemo.updatedAt = date

      // 1行目をタイトル
      const firstLine = (this.currentMemo.body || "").split("\n")[0].trim()
      this.currentMemo.title = firstLine || "新規メモ"

      // 最新順に並べ替え
      this.memos.sort((a, b) => b.updatedAt - a.updatedAt)
    },

    // コピー
    async copyCurrent() {
      if (!this.currentMemo) return
      const text = this.currentMemo.body || ""
      try {
        await navigator.clipboard.writeText(text)
      } catch (_) {
      }
    },
  },
}
</script>

<style scoped>
/* ===== Theme Tokens（暗め + 淡い）===== */
.appShell{
  background:
    radial-gradient(1200px 600px at 20% 0%, rgba(130, 170, 255, 0.12), transparent 50%),
    radial-gradient(1000px 500px at 80% 10%, rgba(180, 140, 255, 0.10), transparent 55%),
    radial-gradient(900px 500px at 40% 90%, rgba(120, 220, 200, 0.08), transparent 60%),
    #2c3442;
}

.mainContainer{
  max-width: 980px;
  padding: 18px 14px 160px;
}

/* ===== Header ===== */
.header{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap: 14px;
  margin-top: 18px;
  margin-bottom: 14px;
}

.brandTitle{
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0.06em;
}
.brandSub{
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.72;
}

.headerActions{
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items:center;
}

.chip{
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.06);
}

.addBtn{
  background: rgba(140, 170, 255, 0.22);
  border: 1px solid rgba(140, 170, 255, 0.30);
}

/* ===== Panels ===== */
.panel{
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  padding: 14px 14px 10px;
}

.editorPanel{
  min-height: 520px;
}

.panelHead{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  padding: 2px 2px 10px;
}

.panelTitle{
  display:flex;
  align-items:center;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.02em;
  opacity: 0.92;
}

.divider{
  opacity: 0.35;
}

.searchField{
  max-width: 180px;
}

.fieldIcon{
  opacity: 0.7;
}

/* ===== List ===== */
.memoList{
  padding: 8px 0 6px;
  background: transparent;
}

.memoItem{
  margin: 8px 0;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.18);
}

/* Vuetify activeの上書き（淡いアクティブ） */
.memoItem.v-list-item--active{
  background: rgba(140, 170, 255, 0.18) !important;
  border-color: rgba(140, 170, 255, 0.25);
}

.memoTitle{
  font-size: 14px;
  font-weight: 700;
}

.memoMeta{
  font-size: 12px;
  opacity: 0.75;
  display:flex;
  align-items:center;
  margin-top: 2px;
}

.iconBtn{
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
}
.iconBtn.danger{
  background: rgba(255, 120, 120, 0.10);
}

/* ===== Editor ===== */
.editor{
  display:flex;
  flex-direction:column;
  gap: 10px;
}

.editorTop{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
  margin-bottom: 2px;
}

.updated{
  font-size: 12px;
  opacity: 0.75;
  display:flex;
  align-items:center;
}

.editorActions{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content:flex-end;
}

.ghostBtn{
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
}

.dangerText{
  color: rgba(255, 160, 160, 0.95);
}

.titlePreview{
  font-weight: 800;
  letter-spacing: 0.02em;
  opacity: 0.92;
  padding: 6px 2px 2px;
}

.editorArea{
  background: transparent;
}

/* ===== Empty States ===== */
.emptyState{
  padding: 18px 10px 14px;
  text-align:center;
  opacity: 0.85;
}
.emptyTitle{
  font-weight: 800;
  margin-top: 8px;
}
.emptySub{
  font-size: 12px;
  margin-top: 6px;
  opacity: 0.75;
}

.emptyEditor{
  height: 100%;
  min-height: 480px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  gap: 8px;
  opacity: 0.9;
}

/* ===== Bottom Hint ===== */
.composerHint{
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 18px;
  width: calc(100% - 28px);
  max-width: 980px;
  z-index: 1000;

  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  padding: 10px 12px;
}

.hintRow{
  display:flex;
  align-items:center;
  font-size: 12px;
  opacity: 0.85;
}

/* ===== Responsive ===== */
@media (max-width: 960px){
  .searchField{ max-width: 220px; }
}
</style>
