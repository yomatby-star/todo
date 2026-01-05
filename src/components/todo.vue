<template>
  <v-app>
    <v-main>
      <v-container style="max-width: 600px" class="mainContainer">
        <h1 class="title">TODO</h1>
        
        <!-- タスク一覧 -->
        <v-card elevation="2" rounded="lg" class="taskCard">
          <h2 class="subTitle">タスク一覧</h2>
          <v-list class="taskScroll">
            <v-list-item 
              v-for="(task, index) in incompleteTasks"
              :key="index"
            >
              <v-list-item-title class="task-text">
                {{ task.text }}
              </v-list-item-title>
              <v-list-item-subtitle class="task-date">
                {{ task.created_at }}
              </v-list-item-subtitle>
              <template #append>
                <v-btn
                  icon
                  color="blue"
                  variant="text"
                  @click="completeTask(task)"
                >
                  <v-text>完了</v-text>
                </v-btn>
                <v-btn
                  icon
                  color="red"
                  variant="text"
                  @click="removeTask(task)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- 完了描画 -->
        <v-card elevation="2" rounded="lg" class="taskCard sub">
          <h2 class="subTitle">完了済み</h2>
          <v-list class="taskScroll">
            <v-list-item
              v-for="task in completedTasks"
              :key="task.text"
            >
              <v-list-item-title class="task-text">
                {{ task.text }}
              </v-list-item-title>
              <v-list-item-subtitle class="task-date">
                {{ task.created_at }}
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  icon
                  color="green"
                  variant="text"
                  @click="restoreTask(task)"
                >
                  <v-icon>mdi-undo</v-icon>
                </v-btn>
                <v-btn
                  icon
                  color="red"
                  variant="text"
                  @click="removeTask(task)"
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
            <v-col cols="9">
              <v-text-field
                v-model="newTask"
                label="やることを入力"
                variant="outlined"
                clearable
                hide-details
                @keyup.enter="addTask"
              />
            </v-col>
            <v-col cols="3" class="pl-3">
              <v-btn
                color="primary"
                block
                rounded
                size="large"
                @click="addTask"
              >
                追加
              </v-btn>
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
    incompleteTasks () {
      return this.tasks.filter(task => !task.status)
    },
    completedTasks () {
      return this.tasks.filter(task => task.status)
    }
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
.mainContainer {
  padding: 8px 12px;
  height: 100vh;
}
.title {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  color: #2f38c27d;
  margin: 38px 8px 8px 8px;
}
.task-text {
  font-size: 16px;
  font-weight: 600;
}
.task-date {
  font-size: 12px;
  color: #888;
}
.flex {
  display: flex;
}
.taskCard {
  max-height: 35vh;
  margin: 0 0 20px;
}
.taskScroll {
  max-height: calc(40vh - 40px);
  overflow-y: auto;
  padding: 0 0 40px;
}
.taskCard::-webkit-scrollbar {
  width: 6px;
}
.taskCard::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 4px;
}
.subTitle {
  font-size:16px;
  text-align: center;
  padding: 4px 0;
  background-color: rgba(36, 26, 44, 0.812);
  color: #bbb;
}
.inputArea {
  padding: 20px;
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 600px;
  z-index: 1000;
}

</style>