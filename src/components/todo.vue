<template>
  <v-app>
    <v-main>
      <v-container style="max-width: 600px" class="mainContainer">
        <!-- <h1 class="title">TODO</h1> -->
        
        <!-- タスク一覧 -->
        <v-card elevation="2" class="taskCard">
          <h2 class="subTitle">タスク一覧</h2>
          <v-list class="taskScroll">
            <v-list-item 
              v-for="(task, index) in sortedTasks"
              :key="index"
              :class="{ completed: task.status }"
            >
              <v-list-item-title class="task-text">
                {{ task.text }}
              </v-list-item-title>
              <v-list-item-subtitle class="task-date">
                {{ task.created_at }}
                <span v-if="task.status && task.completed_at"> / 完了: {{ task.completed_at }}</span>
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
                  @click="removeTask(task)"
                  aria-label="削除"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                
              </template>
            </v-list-item>
          </v-list>
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
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'todo',
  data () {
    return {
      newTask: '',
      tasks: [],
    }
  },
  mounted () {
    const saveTask = localStorage.getItem('tasks');
    if (saveTask) {
      this.tasks = JSON.parse(saveTask)
    }
  },
  computed: {
    sortedTasks () {
      const tasks = [...this.tasks]
      tasks.sort((a, b) => a.status - b.status)
      return tasks
    },
    // incompleteTasks () {
    //   return this.tasks.filter(task => !task.status)
    // },
    // completedTasks () {
    //   return this.tasks.filter(task => task.status)
    // }
  },
  methods: {
    addTask () {
      if (this.newTask.trim() !== '') {
        const task = {
          text: this.newTask,
          created_at: new Date().toLocaleDateString(),
          completed_at: null,
          status: false
        }
        console.log(task)
        this.tasks.unshift(task);
        localStorage.setItem('tasks', JSON.stringify(this.tasks))
        this.newTask = '';
      }
    },
    removeTask (task) {
      this.tasks = this.tasks.filter(i => i !== task)
      localStorage.setItem('tasks', JSON.stringify(this.tasks))
    },
    completeTask (task) {
      task.status = true
      task.completed_at = new Date().toLocaleDateString()
      localStorage.setItem('tasks', JSON.stringify(this.tasks))
      console.log(task)
    },
    restoreTask (task) {
      task.status = false
      task.completed_at = null
      localStorage.setItem('tasks', JSON.stringify(this.tasks))
    }
  }
}
</script>


<style scoped>
/* ===== 背景：暗めの高級感（ダークガラスが映える） ===== */
.mainContainer {
  padding: 10px 12px;
  height: 100vh;
  background:
    radial-gradient(900px 500px at 15% 10%, rgba(130, 90, 255, 0.22), transparent 55%),
    radial-gradient(900px 500px at 85% 25%, rgba(0, 180, 255, 0.18), transparent 55%),
    linear-gradient(180deg, rgba(9, 10, 18, 0.98), rgba(15, 16, 26, 0.98));
}

/* ===== ガラスカード（暗め） ===== */
.inputArea {
  background: rgba(18, 20, 32, 0.55) !important; /* 暗い半透明 */
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

/* これが一番安定：v-card要素に直撃させる */
:deep(.v-card.taskCard) {
  background-color: rgba(18, 20, 32, 0.55) !important;
  background-image: none !important; /* 念のため */
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



/* ===== カードサイズ ===== */
.taskCard {
  max-height: 70vh;
  margin: 0 0 16px;
}

.taskScroll {
  max-height: calc(70vh - 52px);
  overflow-y: auto;
  padding: 6px 0 40px;
}

/* ===== 見出し：黒ベタじゃなく“ダークガラス帯”に ===== */
.subTitle {
  font-size: 14px;
  text-align: center;
  padding: 10px 0;
  font-weight: 700;
  letter-spacing: 0.6px;

  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);

  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}

/* ===== テキスト ===== */
.task-text {
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
}

.task-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

/* 完了済み */
.completed .task-text {
  text-decoration: line-through;
  opacity: 0.55;
}
.completed .task-date {
  opacity: 0.55;
}

/* ===== スクロールバー（ダーク向け） ===== */
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

/* ===== Vuetify内部：TextFieldをダークガラスに馴染ませる ===== */
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

/* ボタン（アイコンボタンが浮きすぎないように） */
:deep(.v-btn) {
  box-shadow: none;
}
</style>
