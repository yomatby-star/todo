<template>
  <v-container class="container">
    <v-row>
      <v-col>
        <v-card class="pa-4 inputArea" elevation="3" rounded="xl">
          
          <div class="summaryMainRow d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              <v-icon>mdi-home-variant</v-icon>  
              収支表
            </div>
            <div class="summaryMain">
              <div class="labelMain">収支</div>
              <div class="valueMain" :class="{ minus: balance < 0 }">
                {{ formatYen(balance) }} 円
              </div>
            </div>
          </div>

          <div class="summary">
            <div class="summaryBox">
              <div class="label">収入</div>
              <div class="value">{{ formatYen(incomeTotal) }} 円</div>
            </div>
            <div class="summaryBox">
              <div class="label">支出</div>
              <div class="value">{{ formatYen(expenseTotal) }} 円</div>
            </div>
          </div>

          <v-divider class="my-4" />

          <!-- 支出カテゴリ -->
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="sectionTitle">{{ year }}年{{ month }}月の明細</div>
            <v-chip
              variant="tonal"
              class="font-weight-bold pa-2"
              size="40px"
              @click="openMonthPicker"
            >
              {{ monthKey }}
              <v-icon end>mdi-chevron-down</v-icon>
            </v-chip>
          </div>

          <div class="detailScroll">
            <div v-if="expenseBreakdown.length === 0" class="empty">
              支出がまだありません
            </div>

            <div v-else class="barList">
              <div v-for="row in expenseBreakdown" :key="'exp-' + row.category" class="barRow">
                <div class="barHead">
                  <div class="barLabel">{{ row.category }}</div>
                  <div class="barValue">
                    {{ formatYen(row.amount) }} 円
                    <span class="pct">（{{ row.pct }}%）</span>
                  </div>
                </div>

                <div class="barTrack">
                  <div class="barFill expense" :style="{ width: row.pct + '%' }"></div>
                </div>
              </div>
            </div>

            <v-divider class="my-4" />

            <!-- 収入カテゴリ -->
            <div class="sectionTitle d-flex align-center justify-space-between mb-3">収入（上位）</div>
            <div v-if="incomeBreakdown.length === 0" class="empty">
              収入がまだありません
            </div>

            <div v-else class="barList">
              <div v-for="row in incomeBreakdown" :key="'inc-' + row.category" class="barRow">
                <div class="barHead">
                  <div class="barLabel">{{ row.category }}</div>
                  <div class="barValue">
                    {{ formatYen(row.amount) }} 円
                    <span class="pct">（{{ row.pct }}%）</span>
                  </div>
                </div>

                <div class="barTrack">
                  <div class="barFill income" :style="{ width: row.pct + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <!-- 年月選択ダイアログ -->
    <v-dialog v-model="monthPickerOpen" max-width="420">
      <v-card class="pa-4" rounded="xl">
        <v-card-title>対象年月を選択</v-card-title>

        <div class="d-flex" style="gap:12px;">
          <v-select
            v-model="tempYear"
            :items="yearItems"
            label="年"
            variant="outlined"
            density="comfortable"
          />
          <v-select
            v-model="tempMonth"
            :items="monthItems"
            label="月"
            variant="outlined"
            density="comfortable"
          />
        </div>

        <v-card-actions class="mt-2">
          <v-spacer />
          <v-btn variant="text" @click="monthPickerOpen = false">キャンセル</v-btn>
          <v-btn color="primary" variant="flat" @click="applyMonth">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import Mixin from "../../mixin.js/mixin"

export default {
  name: "ExpenseTrackerMain",
  mixins: [Mixin],

  data() {
    const { year, month } = this.getCurrentYearMonth()
    return {
      year,
      month,
      monthPickerOpen: false,
      tempYear: year,
      tempMonth: month,
      incomes: [],
      expenses: [],
    }
  },


  computed: {
    yearItems() {
      const base = this.year
      const items = []
      for (let y = base - 5; y <= base + 5; y++) items.push(y)
      return items
    },
    monthItems() {
      return [1,2,3,4,5,6,7,8,9,10,11,12]
    },
    monthKey() {
      const mm = String(this.month).padStart(2, "0")
      return `${this.year}-${mm}`
    },

    monthIncomes() {
      return this.incomes.filter(x => x.monthKey === this.monthKey)
    },
    monthExpenses() {
      return this.expenses.filter(x => x.monthKey === this.monthKey)
    },

    incomeTotal() {
      return this.monthIncomes.reduce((s, x) => s + (Number(x.amount) || 0), 0)
    },
    expenseTotal() {
      return this.monthExpenses.reduce((s, x) => s + (Number(x.amount) || 0), 0)
    },
    balance() {
      return this.incomeTotal - this.expenseTotal
    },

    expenseBreakdown() {
      return this.makeBreakdown(this.monthExpenses, this.expenseTotal, 8)
    },
    incomeBreakdown() {
      return this.makeBreakdown(this.monthIncomes, this.incomeTotal, 8)
    },
  },

  watch: {
    monthKey() {
      this.loadLocal()
    },
  },

  mounted() {
    this.loadLocal()
    window.addEventListener("storage", this.loadLocal)
  },
  beforeUnmount() {
    window.removeEventListener("storage", this.loadLocal)
  },

  methods: {
    openMonthPicker() {
      // 開いた時点で現在値を入れておく（キャンセル時に戻しやすい）
      this.tempYear = this.year
      this.tempMonth = this.month
      this.monthPickerOpen = true
    },

    applyMonth() {
      this.year = this.tempYear
      this.month = this.tempMonth
      this.monthPickerOpen = false
      // monthKeyが変わるのでwatch(monthKey)が動いてloadLocal()される :contentReference[oaicite:1]{index=1}
    },
    loadLocal() {
      const incRaw = localStorage.getItem("income_v1")
      this.incomes = incRaw ? JSON.parse(incRaw) : []

      const expRaw = localStorage.getItem("onexpense_v1")
      this.expenses = expRaw ? JSON.parse(expRaw) : []
    },

    makeBreakdown(list, total, limit = 8) {
      // category別に合計
      const map = {}
      for (const x of list || []) {
        const cat = String(x.category || "未分類")
        const amt = Number(x.amount) || 0
        map[cat] = (map[cat] || 0) + amt
      }

      // 大きい順
      const rows = Object.entries(map)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)

      // 上位limit + その他（見やすくする）
      const head = rows.slice(0, limit)
      const restSum = rows.slice(limit).reduce((s, r) => s + r.amount, 0)
      if (restSum > 0) head.push({ category: "その他", amount: restSum })

      // パーセント付与（totalが0の時は0%）
      return head.map(r => ({
        ...r,
        pct: total > 0 ? Math.round((r.amount / total) * 100) : 0
      }))
    },

    formatYen(n) {
      return (Number(n) || 0).toLocaleString("ja-JP")
    },
  },
}
</script>

<style scoped>
.container {
  padding: 8px 12px 180px;
  height: 100vh;
  background:
    radial-gradient(900px 500px at 15% 10%, rgba(130, 90, 255, 0.22), transparent 55%),
    radial-gradient(900px 500px at 85% 25%, rgba(0, 180, 255, 0.18), transparent 55%),
    linear-gradient(180deg, rgba(9, 10, 18, 0.98), rgba(15, 16, 26, 0.98));
}
.inputArea {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: rgba(59, 62, 85, 0.55) !important;
  border: 1px solid rgba(255, 255, 255, 0.10);

  color: #fff !important;
}
.summaryMainRow{
  display: flex;
  justify-content: flex-end; /* ←右寄せ */
  width: 100%;
  margin:0 0 8px 0;
}
.summaryMain {
  display: inline-flex;
  align-items: center;
  /* margin: 8px 0; */
  border-radius: 9999px;
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); 
}
.summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.mainBox {
  background: #3f51b5;
  color: #fff;
  padding: 10px 16px;
  font-weight: 700;
}
.summaryBox {
  background: rgb(247, 245, 245);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 14px;
  padding: 4px 10px;
  color: rgb(26, 26, 26);
}
.labelMain {
  position: absolute;
  right: 120px;
  padding: 12px 44px;
  border-radius: 9999px 0 0 9999px;
  background: rgba(80, 110, 200, 0.35);
  border: 1px solid rgba(255,255,255,0.10);
  color: #fff;
  font-weight: 800;
  white-space: nowrap;
}
.valueMain {
  font-size: 18px;
  /* font-weight: 800; */
  /* margin-top: 4px; */
  padding: 10px 18px;
  border-radius: 9999px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  color: #111;
  font-weight: 900;
  white-space: nowrap;
  min-width: 140px;
  text-align: right;
  z-index: 2000;
}
.valueMain.minus {
  color: #f30303;
}
.label {
  font-size: 12px;
  opacity: 0.7;
}
.value {
  font-size: 18px;
  font-weight: 800;
  margin-top: 4px;
  text-align: right;
}
.sectionTitle {
  font-weight: 800;
  /* margin-bottom: 10px; */
}
.empty {
  opacity: 0.7;
  padding: 8px 0 2px;
}
.barList {
  display: grid;
  gap: 12px;
}
.detailScroll {
  overflow-y: auto;
  max-height: calc(80vh - 160px); /* 上のヘッダ/サマリー分を引く（調整してOK） */
  padding-right: 6px;
  -webkit-overflow-scrolling: touch;
}
.barHead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}
.barLabel {
  font-weight: 700;
}
.barValue {
  font-size: 13px;
  opacity: 0.85;
  white-space: nowrap;
}
.pct {
  opacity: 0.7;
  margin-left: 6px;
}
.barTrack {
  margin-top: 6px;
  height: 10px;
  border-radius: 999px;
  background: rgba(0,0,0,0.08);
  overflow: hidden;
}
.barFill {
  height: 100%;
  border-radius: 999px;
}
.barFill.expense { background: #a45ada; }
.barFill.income  { background: #3c72ce; }
</style>
