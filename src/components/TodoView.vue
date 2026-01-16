<template>
  <v-app>
    <v-main>
      <v-container class="mainContainer">
        <!-- タスク一覧 -->
        <v-card elevation="2" class="taskCard">
          <div class="subHeader">
            <div class="subTitleText">TODO</div>
            <div class="counts">
              <span class="countPill">
                <span class="pillLabel">未完了</span>
                <span class="pillValue" style="color:fuchsia">{{ incompleteCount }}</span>
              </span>
              <span class="countPill">
                <span class="pillLabel">完了</span>
                <span class="pillValue">{{ completedCount }}</span>
              </span>
            </div>
          </div>

          <v-list class="taskScroll" @scroll.passive="onTaskScroll">
            <v-list-item 
              v-for="task in sortedTasks"
              :key="task.id"
              :class="{ completed: task.status }"
            >
              <v-list-item-title class="task-text">
                {{ task.text }}
              </v-list-item-title>
              <v-list-item-subtitle class="task-date">
                {{ formatDate(task.created_at) }}
                <span v-if="task.status && task.completed_at"> / 完了: {{ formatDate(task.completed_at) }}</span>
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  v-if="!task.status"
                  icon
                  color="blue"
                  variant="text"
                  @click="completeTask(task)"
                  aria-label="完了"
                >
                  <v-icon>mdi-check</v-icon>
                </v-btn>

                <v-btn
                  v-else
                  icon
                  color="green"
                  variant="text"
                  @click="restoreTask(task)"
                  aria-label="戻す"
                >
                  <v-icon>mdi-undo</v-icon>
                </v-btn>

                <v-btn
                  icon
                  color="red"
                  variant="text"
                  @click="openDeleteDialog(task, 'deletingTask', 'deleteDialog')"
                  aria-label="削除"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <v-btn v-if="tasks.length !== 0" @click="allDeleteDialogOpen()" class="rightFixd allDeleteButton" :class="{ hidden: isScrolling }">全削除</v-btn>
        
        </v-card>

        <!-- 入力カード -->
        <v-card class="inputArea" elevation="4" rounded="lg">
          <v-row align="center" no-gutters>
            <v-col cols="12">
              <v-text-field
                v-model="newTask"
                label="やることを入力"
                variant="outlined"
                density="compact"
                clearable
                hide-details
                @keyup.enter="addTask"
              >
                <template #append-inner>
                  <v-btn
                    color="primary"
                    rounded
                    class="ml-2"
                    :disabled="!newTask?.trim()"
                    @click="addTask"
                    aria-label="追加"
                  >
                    <v-icon size="20">mdi-send</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>            
          </v-row>
        </v-card>

        <confirmDelete
          v-model="deleteDialog"
          :message="`${deletingTask?.text} を削除します。`"
          @cancel="cancelDelete('deletingTask', 'deleteDialog')"
          @confirm="confirmDelete('tasks', 'deletingTask', 'deleteDialog')"
        />

        <!-- 全削除 -->
        <v-dialog v-model="allDeleteDialog">
          <v-card elevation="4" rounded="xg" max-width="420" location="center">
            <v-card-text>全部削除しますか？</v-card-text>
            <v-card-actions>
              <v-btn variant="text" @click="allcancelDelete">キャンセル</v-btn>
              <v-btn color="red" variant="flat" @click="allDeleting">はい</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import mixin from "../mixin.js/mixin"
import localStorageSync from "../mixin.js/localStorageSync"
import deletingDialog from "../mixin.js/deletingDialog"
import confirmDelete from "./ConfirmDeleteDialog/ConfirmDeleteDialogView.vue"

export default {
  name: 'TodoView',
  mixins: [mixin, localStorageSync, deletingDialog],
  components: { confirmDelete },
  data () {
    return {
      newTask: '',
      tasks: [],
      deleteDialog: false,
      deletingTask: null,
      allDeleteDialog: false,
      isScrolling: false,
      scrollTimer: null
    }
  },
  mounted () {
    this.startLocalStorageSync("tasks", "tasks", [])
  },
  computed: {
    sortedTasks () {
      return [...this.tasks].sort((a, b) => {
        if(a.status !== b.status) return Number(a.status) - Number(b.status)
        return (b.created_at ?? 0) - (a.created_at ?? 0)
      })
    },
    incompleteCount () {
      return this.tasks.filter(x => !x.status).length
    },
    completedCount () {
      return this.tasks.filter(x => x.status).length
    }
  },
  methods: {
    addTask () {
        const text = this.newTask.trim()
        if(!text) return
        const task = {
          id: this.makeId(),
          text,
          created_at: this.yyyymmdd(),
          completed_at: null,
          status: false
        }
        this.tasks.unshift(task);
        this.newTask = '';
        console.log("追加したid:", task)
    },
    completeTask (task) {
      task.status = true
      task.completed_at = this.yyyymmddH()
    },
    restoreTask (task) {
      task.status = false
      task.completed_at = null
    },
    allDeleteDialogOpen () {
      this.allDeleteDialog = true
    },
    allcancelDelete () {
      this.allDeleteDialog = false
    },
    allDeleting () {
      this.tasks = []
      this.allDeleteDialog = false
    },
    onTaskScroll () {
      this.isScrolling = true
      if(this.scrollTimer) clearTimeout(this.scrollTimer)
      this.scrollTimer = setTimeout(()=> {
        this.isScrolling = false
      }, 180)
    }
  }
}
</script>


<style scoped>
.mainContainer {
  padding: 10px 12px;
  min-height: 100dvh;
  background-color: transparent;
}
@media (min-width: 768px) {
  :deep(.taskCard) {
    width: 100% !important;
    max-width: none !important;
    height: 80vh !important;
    max-height: none !important;
  }
  :deep(.taskCard .taskScroll) {
    max-height: calc(80vh - 52px) !important;
  }
  .inputArea {
    max-width: 1200px !important;
  }
}
.inputArea {
  background: rgba(18, 20, 32, 0.55) !important;
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    0 14px 40px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 18px;
  padding: 10px;
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 600px;
  z-index: 1000;
}
:deep(.v-card.taskCard) {
  background-color: rgba(18, 20, 32, 0.55) !important;
  background-image: none !important;
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    0 14px 40px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 18px;
}
:deep(.taskCard .v-list) {
  background: transparent !important;
}
.taskCard {
  max-height: 65vh;
  margin: 0 0 16px;
}
.taskScroll {
  max-height: calc(65vh - 52px);
  overflow-y: auto;
  padding: 6px 0 60px;
}
.subHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 12px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);

  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.07),
    rgba(255, 255, 255, 0.04)
  );

  color: rgba(255, 255, 255, 0.90);

  border-top-left-radius: 18px;
  border-top-right-radius: 18px;

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.subTitleText {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.7px;
  color: rgba(255, 255, 255, 0.88);
}
.counts {
  display: flex;
  gap: 10px;
}
.countPill {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 6px 10px;
  border-radius: 999px;

  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.14);

  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);

  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  user-select: none;
}
.pillLabel {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: rgba(255, 255, 255, 0.68);
}
.pillValue {
  min-width: 22px;
  text-align: center;

  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.4px;

  color: rgba(255, 255, 255, 0.92);

  padding: 3px 8px;
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.10);
}
.countPill[data-tone="todo"] {
  border-color: rgba(80, 140, 255, 0.22);
}
.countPill[data-tone="todo"] .pillValue {
  background: rgba(80, 140, 255, 0.12);
  border-color: rgba(80, 140, 255, 0.18);
}
.countPill[data-tone="done"] {
  border-color: rgba(0, 255, 160, 0.20);
}
.countPill[data-tone="done"] .pillValue {
  background: rgba(0, 255, 160, 0.10);
  border-color: rgba(0, 255, 160, 0.16);
}
.countPill:hover {
  transform: translateY(-1px);
  transition: transform 120ms ease, border-color 120ms ease;
}
.countPill:active {
  transform: translateY(0px);
}
.task-text {
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
}
.task-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}
.completed .task-text {
  text-decoration: line-through;
  opacity: 0.55;
}
.completed .task-date {
  opacity: 0.55;
}
.taskScroll::-webkit-scrollbar {
  width: 6px;
}
.taskScroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}
.taskScroll::-webkit-scrollbar-track {
  background: transparent;
}
:deep(.v-field) {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
:deep(.v-field__input) {
  color: rgba(255, 255, 255, 0.88);
}
:deep(.v-label) {
  color: rgba(255, 255, 255, 0.55);
}
:deep(.v-field__outline) {
  opacity: 0.4;
}
:deep(.v-btn) {
  box-shadow: none;
}
/* .confirmCard {
  background: rgba(18, 20, 32, 0.72) !important;
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: rgba(255, 255, 255, 0.90);
} */
.allDeleteButton {
  background: rgba(18, 20, 32, 0.35) !important;
  backdrop-filter: blur(14px) saturate(140%) brightness(110%);
  -webkit-backdrop-filter: blur(14px) saturate(140%) brightness(110%);
  border: 1px solid rgba(255,255,255,0.12);
  color: aliceblue !important;
  min-width: 40px;
  height: 40px;
  border-radius: 12px;
  padding: 4px;
  transition: opacity 160ms ease, transform 160ms ease;
}
.allDeleteButton.hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(6px);
}
.rightFixd {
  position: fixed;
  right: 4px;
  bottom: 0;
}
</style>
