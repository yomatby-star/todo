<script>
import Todo from './components/todo.vue'
import Memo from './components/memo.vue'
import ExpenseTracker from './components/ExpenseTracker/ExpenseTrackerMain.vue'
import Mixin from "./mixin.js/mixin"

export default {
  name: 'App',
  mixins: [Mixin],
  components: {
    Todo,
    Memo,
    ExpenseTracker
  },
  computed: {
    isExpenseArea () {
      const p = this.$route.path
      return (
        p.startsWith("/ExpenseTracker") ||
        p.startsWith("/incomForm") ||
        p.startsWith("/expenseListView") 
      )
    },
    isHomeActive () {
      return this.$route.path.startsWith("/ExpenseTracker")
    },
    isIncomeActive () {
      return this.$route.path.startsWith("/incomForm")
    },
    isExpenseActive () {
      return this.$route.path.startsWith("/expenseListView")
    },
    // 下のナビ用（家計簿エリア全体）
    isExpenseNavActive () {
      return this.isExpenseArea
    },
    isTasksActive () {
      return this.$route.path.startsWith("/tasks")
    },
    isMemoActive () {
      return this.$route.path.startsWith("/memo")
    },
  },
  methods: {
    go(path) {
      this.$router.push(path)
    }
  }
}
</script>

<template>
  <div class="app">
    <main class="content">
      <router-view />
    </main>
    <!-- 家計簿のみ描画 -->
    <v-card v-if="isExpenseArea" class="bottom-bar" elevation="4" rounded="lg">
      <div class="btn-row">
        <v-btn
          class="flex-1"
          :class="{ activeBtn: isHomeActive }"
          :variant="isHomeActive ? 'flat' : 'outlined'"
          :color="isHomeActive ? 'primary' : undefined"
          @click="go('/ExpenseTracker')"
        >
          ホーム
        </v-btn>

        <v-btn
          class="flex-1"
          :class="{ activeBtn: isIncomeActive }"
          :variant="isIncomeActive ? 'flat' : 'outlined'"
          :color="isIncomeActive ? 'primary' : undefined"
          @click="go('/incomForm')"
        >
          収入
        </v-btn>

        <v-btn
          class="flex-1"
          :class="{ activeBtn: isExpenseActive }"
          :variant="isExpenseActive ? 'flat' : 'outlined'"
          :color="isExpenseActive ? 'primary' : undefined"
          @click="go('/expenseListView')"
        >
          支出
        </v-btn>

      </div>
    </v-card>
    <!-- 常に描画 -->
    <nav class="buttonNav">
      <button
        class="navItem iconNav"
        :class="{ activeNav: isTasksActive }"
        @click="go('/tasks')"
        aria-label="タスク"
      >
        <v-icon size="22">mdi-format-list-checks</v-icon>
        <!-- <span class="navLabel">タスク</span> -->
      </button>

      <button
        class="navItem iconNav"
        :class="{ activeNav: isMemoActive }"
        @click="go('/memo')"
        aria-label="メモ"
      >
        <v-icon size="22">mdi-note-text</v-icon>
        <!-- <span class="navLabel">メモ</span> -->
      </button>

      <button
        class="navItem iconNav"
        :class="{ activeNav: isExpenseNavActive }"
        @click="go('/ExpenseTracker')"
        aria-label="家計簿"
      >
        <v-icon size="22">mdi-cash-multiple</v-icon>
        <!-- <span class="navLabel">家計簿</span> -->
      </button>

      <button
        class="navItem iconNav"
        :class="{ activeNav: isCalendarActive }"
        @click="go('/calendar')"
        aria-label="カレンダー"
      >
        <v-icon size="22">mdi-calendar-month</v-icon>
        <!-- <span class="navLabel">カレンダー</span> -->
      </button>
    </nav>


  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #cfc9c980;
}
.buttonNav {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 10px;
  background-color: rgba(243, 240, 245, 0.292);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 18px;
  padding: 10px;
  box-shadow: 0 10px 30px;
  z-index: 1000;
}
.navItem {
  flex: 1;
  height: 100%;
  border: none;
  border-radius: 14px;
  background-color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  color: #222;
  display:  flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 14px rgba(0,0,0,0.10);
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.08s ease, background 0.08s ease;
}
.nav-item:active{ background:#f2f2f2; }
/* .navItem:hover {
  background: #f3f4f6;
} */
.navItem:active {
  transform: translateY(1px);
  box-shadow: 0 3px 8px rgba(0,0,0,0.12);
  background: #eceff4;
}

/* 家計簿 */
.bottom-bar {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 90px;
  padding: 12px;
  margin-bottom: env(safe-area-inset-bottom);
}
.btn-row {
  display: flex;
  gap: 10px;
}
.flex-1 {
  flex: 1;
}

.activeBtn {
  transform: translateY(-1px);
}
.activeNav {
  background: #637ec6;
  color: #eceff4;
  box-shadow: 0 8px 18px rgba(0,0,0,0.12);
  transform: translateY(-1px);
}


</style>
