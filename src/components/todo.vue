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
              v-for="(task, index) in sortedTasks"
              :key="index"
              :class="{computed: task.status}"
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
                  variant="test"
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
                  icom
                  color="red"
                  variant="text"
                  @click=removeTask(task)
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
                    :desabled="!newTask?.trim()"
                    @click="addTask"
                    aria-label="保存"
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
import { computed } from 'vue';

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
.mainContainer {
  padding: 8px 12px;
  height: 100vh;
}
.title {
  text-align: left;
  font-size: 28px;
  font-weight: bold;
  color: #484fb57d;
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
  max-height: 60vh;
  margin: 0 0 20px;
}
.taskScroll {
  max-height: calc(60vh - 40px);
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
  padding: 8px;
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 600px;
  z-index: 1000;
}
.computed .task-text {
  text-decoration: line-through;
  opacity: 0.6;
}

</style>