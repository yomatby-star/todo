<template>
  <v-app theme="dark" class="appShell">
    <v-main>
      <v-container class="mainContainer">
        <!-- ===== Header ===== -->
        <header class="header">
          <div class="brand">
            <div class="brandTitle">TODO</div>
          </div>

          <div class="stats">
            <v-chip class="chip" variant="tonal" size="small">
              未完了 {{ incompleteTasks.length }}
            </v-chip>
            <v-chip class="chip" variant="tonal" size="small">
              完了 {{ completedTasks.length }}
            </v-chip>
          </div>
        </header>

        <!-- ===== 未完了 ===== -->
        <v-card class="panel" rounded="xl" elevation="0">
          <div class="panelHead">
            <div class="panelTitle">
              <v-icon size="18" class="mr-2">mdi-format-list-checks</v-icon>
              タスク一覧
            </div>

            <v-btn
              class="ghostBtn"
              variant="text"
              size="small"
              :disabled="tasks.length === 0"
              @click="clearAll"
            >
              <v-icon size="18">mdi-broom</v-icon>
              全消し
            </v-btn>
          </div>

          <v-divider class="divider" />

          <div v-if="incompleteTasks.length === 0" class="emptyState">
            <v-icon size="22">mdi-weather-night</v-icon>
            <div class="emptyTitle">いまは静か。</div>
            <div class="emptySub">やることを追加して、淡々と片付けよう。</div>
          </div>

          <v-list v-else class="taskList">
            <v-list-item
              v-for="(task, index) in incompleteTasks"
              :key="`todo-${task.created_at}-${index}`"
              class="taskItem"
              rounded="lg"
            >
              <template #prepend>
                <v-btn
                  icon
                  class="iconBtn"
                  variant="text"
                  @click="completeTask(task)"
                  aria-label="完了にする"
                >
                  <v-icon>mdi-check-circle-outline</v-icon>
                </v-btn>
              </template>

              <v-list-item-title class="taskText">
                {{ task.text }}
              </v-list-item-title>

              <v-list-item-subtitle class="taskMeta">
                <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
                {{ task.created_at }}
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  icon
                  class="iconBtn danger"
                  variant="text"
                  @click="removeTask(task)"
                  aria-label="削除"
                >
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- ===== 完了 ===== -->
        <v-card class="panel subPanel" rounded="xl" elevation="0">
          <div class="panelHead">
            <div class="panelTitle">
              <v-icon size="18" class="mr-2">mdi-check</v-icon>
              完了済み
            </div>

            <v-btn
              class="ghostBtn"
              variant="text"
              size="small"
              :disabled="completedTasks.length === 0"
              @click="clearCompleted"
            >
              <v-icon size="18">mdi-trash-can-outline</v-icon>
              完了を削除
            </v-btn>
          </div>

          <v-divider class="divider" />

          <div v-if="completedTasks.length === 0" class="emptyState small">
            <v-icon size="18">mdi-star-outline</v-icon>
            <div class="emptyTitle">まだ完了はありません</div>
          </div>

          <v-list v-else class="taskList">
            <v-list-item
              v-for="(task, index) in completedTasks"
              :key="`done-${task.created_at}-${index}`"
              class="taskItem done"
              rounded="lg"
            >
              <template #prepend>
                <v-btn
                  icon
                  class="iconBtn"
                  variant="text"
                  @click="restoreTask(task)"
                  aria-label="戻す"
                >
                  <v-icon>mdi-undo-variant</v-icon>
                </v-btn>
              </template>

              <v-list-item-title class="taskText doneText">
                {{ task.text }}
              </v-list-item-title>

              <v-list-item-subtitle class="taskMeta">
                <v-icon size="14" class="mr-1">mdi-calendar-check-outline</v-icon>
                {{ task.completed_at || task.created_at }}
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  icon
                  class="iconBtn danger"
                  variant="text"
                  @click="removeTask(task)"
                  aria-label="削除"
                >
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- ===== 入力バー ===== -->
        <v-card class="composer" rounded="xl" elevation="0">
          <div class="composerInner">
            <v-text-field
              v-model="newTask"
              class="composerField"
              label="やることを入力"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              @keyup.enter="addTask"
            >
              <template #prepend-inner>
                <v-icon size="18" class="fieldIcon">mdi-plus</v-icon>
              </template>
            </v-text-field>

            <v-btn
              class="addBtn"
              rounded="xl"
              size="large"
              :disabled="newTask.trim() === ''"
              @click="addTask"
            >
              <v-icon size="18" class="mr-1">mdi-plus</v-icon>
              追加
            </v-btn>
          </div>

          
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "todo",
  data() {
    return {
      newTask: "",
      tasks: [],
    }
  },
  mounted() {
    const saveTask = localStorage.getItem("tasks")
    if (saveTask) this.tasks = JSON.parse(saveTask)
  },
  computed: {
    incompleteTasks() {
      return this.tasks.filter((task) => !task.status)
    },
    completedTasks() {
      return this.tasks.filter((task) => task.status)
    },
  },
  methods: {
    persist() {
      localStorage.setItem("tasks", JSON.stringify(this.tasks))
    },
    addTask() {
      if (this.newTask.trim() !== "") {
        const task = {
          text: this.newTask.trim(),
          created_at: new Date().toLocaleDateString(),
          completed_at: null,
          status: false,
        }
        this.tasks.unshift(task)
        this.persist()
        this.newTask = ""
      }
    },
    removeTask(task) {
      this.tasks = this.tasks.filter((i) => i !== task)
      this.persist()
    },
    completeTask(task) {
      task.status = true
      task.completed_at = new Date().toLocaleDateString()
      this.persist()
    },
    restoreTask(task) {
      task.status = false
      task.completed_at = null
      this.persist()
    },

    // UX用：一括操作（あると気持ちいい）
    clearCompleted() {
      this.tasks = this.tasks.filter((t) => !t.status)
      this.persist()
    },
    clearAll() {
      this.tasks = []
      this.persist()
    },
  },
}
</script>

<style scoped>
/* ===== Theme Tokens（暗め + 淡い）===== */
.appShell{
  /* ほんのり青紫の暗背景 */
  background:
    radial-gradient(1200px 600px at 20% 0%, rgba(130, 170, 255, 0.12), transparent 50%),
    radial-gradient(1000px 500px at 80% 10%, rgba(180, 140, 255, 0.10), transparent 55%),
    radial-gradient(900px 500px at 40% 90%, rgba(120, 220, 200, 0.08), transparent 60%),
    #0e1116;
}

/* コンテンツ幅・余白 */
.mainContainer{
  max-width: 720px;
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

.stats{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.chip{
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.06);
}

/* ===== Panels ===== */
.panel{
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  padding: 14px 14px 10px;
  margin-bottom: 14px;
}

.subPanel{
  background: rgba(255,255,255,0.035);
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

/* 小さめの“ゴースト”ボタン（雰囲気を壊さない） */
.ghostBtn{
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
}

/* ===== Lists ===== */
.taskList{
  padding: 8px 0 6px;
  background: transparent;
}

.taskItem{
  margin: 8px 0;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.18);
}

.taskText{
  font-size: 15px;
  font-weight: 650;
}

.taskMeta{
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

/* 完了済みは淡く */
.done{
  opacity: 0.72;
}
.doneText{
  text-decoration: line-through;
  opacity: 0.9;
}

/* ===== Empty State ===== */
.emptyState{
  padding: 18px 10px 14px;
  text-align:center;
  opacity: 0.85;
}
.emptyState.small{
  padding: 14px 10px 10px;
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

/* ===== Composer（入力バー） ===== */
.composer{
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 90px;
  width: calc(100% - 28px);
  max-width: 720px;
  z-index: 1000;

  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  padding: 12px;
}

.composerInner{
  display:flex;
  gap: 10px;
  align-items: center;
}

.composerField{
  flex: 1;
}
.fieldIcon{
  opacity: 0.7;
}

/* 追加ボタン：淡いアクセントで“主役”に */
.addBtn{
  min-width: 120px;
  background: rgba(140, 170, 255, 0.22);
  border: 1px solid rgba(140, 170, 255, 0.30);
}

.hint{
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.10);
}
</style>
