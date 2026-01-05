<template>
  <v-container class="container">
    <v-row justify="center">
      <v-col cols="12" md="6">

        <!-- 明細リスト -->
        <!-- 支出合計が見れる場所※カレンダーで日付変更して確認可能 -->
        <v-card class="pa-4 mt-4" elevation="3" rounded="xl">
          <div>
            <!-- 今月合計 -->
            <v-card class="pa-4" variant="tonal" rounded="xl">
              <div class="flex">
                <div class="text-subtitle-1 font-weight-bold">{{ year }}年 {{ month }}月分</div>
                <div class="text-h6 font-weight-bold">{{ formatYen(monthTotal) }} 円</div>
              </div>
            </v-card>
          </div>

          <v-divider class="my-3"/>

          <!-- 登録内容表示 -->
          <v-list v-if="monthExpenses.length">
            <v-list-item v-for="m in monthExpenses" :key="m.id">
              <v-list-item-title class="flex">
                <span>{{ m.category }} <span> - {{ m.note }}</span></span>
                <span>{{ formatYen(m.amount) }}円</span>
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ formatDate(m.createdAt) }}
              </v-list-item-subtitle>

              <template #append>
                <v-btn icon="mdi-delete" color="red" variant="text" @click="removeOnExpense(m.id)"></v-btn>
              </template>
            </v-list-item>
          </v-list>

          <div v-else class="text-center text-medium-emphasis">
            支出が登録されていません
          </div>
        </v-card>



        <!-- 支出オプションボタン一覧を表示（） -->
        <v-card class="pa-4 mt-4" elevation="3" rounded="xl">
          <div class="flex">
            <div class="text-subtitle-1 font-weight-bold">支出登録</div>
            <!-- 年月チップ（押すと月変更UI表示） -->
            <v-chip size="large" variant="tonal" class="font-weight-bold" @click="openMonthPicker">
              {{ year }}年 {{ month }}月
              <v-icon end>mdi-chevron-down</v-icon>
            </v-chip>
          </div>

          <v-divider class="my-3"/>

          <div class="flex">
            <!-- カテゴリ -->
            <v-select
              v-model="form.category"
              :items="onExpenseCategories"
              label="カテゴリ"
              placeholder="カテゴリ"
              variant="outlined"
            />

            <!-- 金額 -->
            <v-text-field
              v-model.number="form.amount"
              type="number"
              label="金額"
              placeholder="例）25000"
              variant="outlined"
            />
          </div>

            <!-- メモ -->
            <v-text-field
              v-model="form.note"
              label="メモ（任意）"
              placeholder="任意"
              variant="outlined"
            />

            <v-btn
              block
              size="large"
              :disabled="!canSave"
              @click="saveOnExpense"
            >
            保存
            </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- 年次選択ダイアログ -->
    <v-dialog v-model="monthPickerOpen">
      <v-card class="pa-4 mt-4" elevation="3" rounded="xl">
        <v-card-title>対象月を選択</v-card-title>
        
        <!-- 年次セレクタ -->
        <div class="flex">
          <v-select
            v-model="year"
            :items="yearItems"
            label="年"
            variant="outlined"
            density="comfortable"
          />
          <v-select
            v-model="month"
            :items="monthItems"
            label="月"
            variant="outlined"
            density="comfortable"
          />
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Mixin from '../../mixin.js/mixin'
export default {
  name: "expenseListView",
  mixins: [Mixin],
  data () {
    const { year, month } = this.getCurrentYearMonth()
    return {
      year,
      month,
      monthPickerOpen: false,
      form: {
        amount: null,
        category: "家賃",
        note: ""
      },
      onExpense: [],
      onExpenseCategories: ["家賃","光熱費","携帯代","猫","住民税","食費","接待費","雑費","ジム","その他"]
    }
  },
  mounted() {
    const saved = localStorage.getItem("onexpense_v1")
    this.onExpense = saved ? JSON.parse(saved) : []
  },
  watch: {
    onExpense: {
      deep: true,
      handler(val) {
        localStorage.setItem("onexpense_v1", JSON.stringify(val))
      }
    }
  },
  computed: {
    // 年
    yearItems () {
      const base = this.year
      const items = []
      for (let y = base - 5; y <= base + 5; y++) items.push(y)
      return items
    },
    // 月
    monthItems () {
      return [1,2,3,4,5,6,7,8,9,10,11,12]
    },
    // 成形
    monthKey () {
      // "2026-01" みたいな形式に統一
      const mm = String(this.month).padStart(2, "0")
      return `${this.year}-${mm}`
    },
    monthExpenses () {
      return this.onExpense
        .filter(x => x.monthKey === this.monthKey)
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    },
    monthTotal () {
      return this.monthExpenses.reduce((sum, x) => sum + (Number(x.amount) || 0), 0)
    },
    canSave() {
      const a = Number(this.form.amount)
      return !!this.year && !!this.month && !!this.form.category && a > 0
    }
  },
  methods: {
    // 金額合計
    formatYen(n) {
      const num = Number(n) || 0
      return num.toLocaleString("ja-JP")
    },
    openMonthPicker() {
      // this.monthInput = this.ym
      this.monthPickerOpen = true
    },
    // 保存処理
    saveOnExpense() {
      const item = {
        id: this.makeId(),
        monthKey: this.monthKey,
        amount: Number(this.form.amount),
        category: this.form.category,
        note: String(this.form.note ?? "").trim(),
        createdAt: Date.now()
      }
      console.log("item:", item)
      this.onExpense.unshift(item)
      console.log("onExpense[0]:", this.onExpense[0]);
      console.log("length:", this.onExpense.length);
      console.log("all:", this.onExpense);
      console.log("保存されたアイテム:", item)
      this.form.amount = ""
      this.form.note = ""
      this.message = "保存完了"
      setTimeout(() => (this.message = ""), 1200)
    },
    removeOnExpense(id) {
      this.onExpense = this.onExpense.filter((x) => x.id !== id)
    }
  },
}
</script>


<style scoped>
.container {
  padding: 8px 12px 150px;
}
.flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>