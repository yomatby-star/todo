<template>
  <v-container class="py-4 mainContainer">
    <v-row>
      <!-- 左：メモ一覧 -->
      <v-col cols="12" md="4">
        <v-card class="pa-3 mainCard" elevation="2" rounded="xl">
          <div class="d-flex align-center justify-space-between">
            <div class="text-h6">MEMO</div>
            <span class="pillValue">{{ memos.length }} 件</span>

            <!-- ＋で新規作成 → ダイアログを開く -->
            <!-- <v-btn icon variant="text" @click="createMemoAndOpen()">
              <v-icon>mdi-plus</v-icon>
            </v-btn> -->
          </div>

          <v-divider class="my-2" />

          <v-list v-if="memos.length > 0" class="listsArea">
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
                  @click.stop="openDeleteDialog(m, 'deletingMemo', 'deleteDialog')"
                >
                  <v-icon color="red">mdi-delete</v-icon>
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
            @click="openDeleteDialog(currentMemo, 'deletingMemo', 'deleteDialog')"
            aria-label="削除"
          >
            <v-icon color="red">mdi-delete</v-icon>
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

    <!-- ＋ボタン配置 -->
    <v-btn
      class="fabAdd"
      icon
      size="large"
      @click="createMemoAndOpen()"
      aria-label="新規メモ"
    >
      <v-icon color="white">mdi-plus</v-icon>
    </v-btn>

    <confirmDelete 
      v-model="deleteDialog"
      :message="`${deletingMemo?.title || 'このメモ'} を削除します。`"
      @cancel="cancelDelete('deletingMemo', 'deleteDialog')"
      @confirm="onConfirmDelete"
    />
  </v-container>
</template>

<script>
import Mixin from '../mixin.js/mixin'
import localStorageSync from '../mixin.js/localStorageSync'
import deletingDialog from '../mixin.js/deletingDialog'
import confirmDelete from './ConfirmDeleteDialog/ConfirmDeleteDialogView.vue'

export default {
  name: "memo",
  mixins: [Mixin,localStorageSync, deletingDialog],
  components: { confirmDelete },
  data () {
    return {
      memos: [],
      selectedId: null,
      editorOpen: false,
      deleteDialog: false,
      deletingMemo: null,
      closeEditorOnDelete: false
    }
  },
  mounted() {
    this.startLocalStorageSync("memos_v1", "memos", [])
  },
  computed: {
    currentMemo() {
      return this.memos.find((m) => m.id === this.selectedId) || null
    },
  },
  methods: {
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
    touchCurrentMemo() {
      if (!this.currentMemo) return
      const date = Date.now()
      this.currentMemo.updatedAt = date
      const firstLine = (this.currentMemo.body || "").split("\n")[0].trim()
      this.currentMemo.title = firstLine || "新規メモ"
      this.memos.sort((a, b) => b.updatedAt - a.updatedAt)
    },
    onConfirmDelete() {
      this.confirmDelete(
        'memos', 'deletingMemo', 'deleteDialog', 
        (target) => {
          if(target?.id === this.selectedId) {
            this.editorOpen = false
            this.deletingMemo = null
          }
        }
      )
    }
  }
}
</script>

<style scoped>
.mainContainer {
  height: 100dvh;
  background-color: transparent;
}
.fabAdd {
  position: fixed;
  right: 8px;
  bottom: 90px;
  z-index: 2000;
  background: rgba(147, 151, 197, 0.72) !important;
  border:  1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.55);
}
.mainCard {
  background:
    radial-gradient(900px 500px at 15% 10%, rgba(130, 90, 255, 0.22), transparent 55%),
    radial-gradient(900px 500px at 85% 25%, rgba(105, 124, 132, 0.18), transparent 55%),
    linear-gradient(180deg, rgba(230, 230, 235, 0.98), rgba(176, 176, 179, 0.98));
}
.listsArea {
  max-height: 60vh;
  overflow: auto;
  padding: 0;
  background:
    radial-gradient(900px 500px at 15% 10%, rgba(130, 90, 255, 0.22), transparent 55%),
    radial-gradient(900px 500px at 85% 25%, rgba(190, 196, 198, 0.18), transparent 55%),
    linear-gradient(180deg, rgba(230, 230, 235, 0.98), rgba(176, 176, 179, 0.98));
}
.confirmCard {
  background: rgba(18, 20, 32, 0.72) !important;
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: rgba(255, 255, 255, 0.90);
}
</style>
