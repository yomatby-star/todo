<script>
import Todo from './components/todo.vue'
import Memo from './components/memo.vue'
import ExpenseTracker from './components/ExpenseTracker/ExpenseTrackerMain.vue'
import Mixin from "./mixin.js/mixin"

export default {
  name: 'App',
  mixins: [Mixin],
  data() {
    return {
      addSheet: false,
    }
  },
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
    isExpenseHomeArea () {
      const p = this.$route.path
      return (
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
    },
    openAddSheet() {
      this.addSheet = true
    },
    goAddExpense() {
      this.addSheet = false
      this.go("/expenseListView")
    },
    goAddIncome() {
      this.addSheet =false
      this.go("/incomForm")
    },
    goAddHome() {
      this.addSheet = false
      this.go("/ExpenseTracker")
    }
  }
}
</script>

<template>
  <div class="app">
    <main class="content">
      <router-view />
    </main>

    <div v-if="isExpenseArea"  class="expenseFabWrap">
      <v-btn 
        class="expenseFab"
        icon
        size="large"
        @click="openAddSheet"
        aria-label="追加"
      >
        <v-icon size="28" color="white">mdi-plus</v-icon>
      </v-btn>

      <v-btn
          v-if="isExpenseHomeArea"
          rounded="xl"
          class="sheetBtn sheetBtnHome homeAreaBtn"
          :class="{ activeSheetBtn: isHomeActive }"
          @click="goAddHome"
        >
          <v-icon>mdi-home-variant</v-icon>
          <!-- <v-icon start>mdi-view-dashboard-outline</v-icon> -->
          <!-- ホーム -->
        </v-btn>
    </div>

    <!-- ダイアログ -->
    <v-bottom-sheet v-model="addSheet" inset>
      <v-card class="sheetCard" rounded="xl">
        <div class="sheetHandle" />
        

        <v-btn
          block
          size="large"
          rounded="xl"
          class="sheetBtn sheetBtnIncome"
          :class="{ activeSheetBtn: isIncomeActive }"
          @click="goAddIncome"
        >
          <!-- <v-icon start>mdi-currency-jpy</v-icon> -->
          収入を追加
        </v-btn>

        <v-btn
          block
          size="large"
          rounded="xl"
          class="sheetBtn sheetBtnExpense"
          :class="{ activeSheetBtn: isExpenseActive }"
          @click="goAddExpense"
        >
          <!-- <v-icon>mdi-currency-jpy</v-icon> -->
          支出を追加
        </v-btn>

        <v-btn
          block
          size="large"
          rounded="xl"
          variant="tonal"
          class="sheetBtn sheetBtnCancel"
          @click="addSheet = false"
        >
          キャンセル
        </v-btn>
      </v-card>
    </v-bottom-sheet>

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

      <!-- <button
        class="navItem iconNav"
        :class="{ activeNav: isCalendarActive }"
        @click="go('/calendar')"
        aria-label="カレンダー"
      >
        <v-icon size="22">mdi-calendar-month</v-icon> -->
        <!-- <span class="navLabel">カレンダー</span> -->
      <!-- </button> -->
    </nav>


  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
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
  background-color: rgba(243, 240, 245, 0.924);
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
.expenseFabWrap {
  position: fixed;
  right: 4px;
  bottom: 86px;
  z-index: 1100;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.expenseFab {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: rgba(147, 151, 197, 0.72) !important;
  border:  1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.55);
}
.sheetCard {
  padding: 14px;
  background: rgba(235, 238, 244, 0.92);
  backdrop-filter: blur(10px);
}
.sheetHandle {
  width:  48px;
  height: 5px;
  border-radius: 999px;
  background: rgba(0,0,0,0.18);
  margin: 0 auto 12px auto;
}
.sheetBtn{
  margin: 0 0 12px 0;
  font-weight: 700;
  width: 100%;
  transform-origin: center;
  transform: scaleX(0.92);
  transition: transform 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease;
  filter: saturate(0.95);
}
.homeAreaBtn {
  position: fixed;
  right: -20px;
  bottom: 150px;
  max-width: 20px;
  max-height: 30px;
  margin: 0 26px 0 0;
}
.sheetBtn.activeSheetBtn{
  transform: scaleX(1);
  filter: saturate(1.05);
  box-shadow:
    0 18px 30px rgba(0,0,0,0.18),
    0 0 0 2px rgba(120,160,255,0.35),
    inset 0 1px 0 rgba(255,255,255,0.55) !important;
}
.sheetBtnHome {
  background: linear-gradient(90deg, rgba(106, 125, 181, 0.75), rgba(255,255,255,0.65));
}
.sheetBtnIncome {
  background: linear-gradient(90deg, rgba(190,220,255,0.75), rgba(255,255,255,0.65));
}
.sheetBtnExpense {
  background: linear-gradient(90deg, rgba(255,190,205,0.75), rgba(255,255,255,0.65));
}
.sheetBtnCancel {
  margin-bottom: 0;
}
</style>
