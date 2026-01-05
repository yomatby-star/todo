<template>
  <v-container class="container">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <!-- 明細リスト -->
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

          <v-list v-if="monthIncomes.length">
            <v-list-item v-for="it in monthIncomes" :key="it.id">
              <v-list-item-title class="flex">
                <span>{{ it.category }} <span class="text-medium-emphasis">- {{ it.note }}</span></span>
                <span class="font-weight-bold">{{ formatYen(it.amount) }} 円</span>
              </v-list-item-title>

              <v-list-item-subtitle>
                登録 {{ formatDate(it.createdAt) }}
              </v-list-item-subtitle>

              <template #append>
                <v-btn icon="mdi-delete" variant="text" color="red" @click.stop="removeIncome(it.id)"/>
              </template>
            </v-list-item>
          </v-list>

          <div v-else class="text-center text-medium-emphasis">
            収入が登録されていません
          </div>
        </v-card>

        <!-- 入力フォーム -->
        <v-card class="pa-4 mt-4" elevation="3" rounded="xl">
          <!-- 年次登録 -->
          <div class="flex">
            <div class="text-subtitle-1 font-weight-bold">収入登録</div>
            <!-- 年月チップ -->
            <v-chip size="large" variant="tonal" class="font-weight-bold" @click="openMonthPicker">
              {{ year }}年 {{ month }}月
              <v-icon end>mdi-chevron-down</v-icon>
            </v-chip>
          </div>

          <v-divider class="my-4"/>

          <!-- 年次セレクタ -->
          <!-- <div class="flex">
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
          </div> -->

          
          <div class="flex">
            <!-- カテゴリ選択 -->
            <v-select
              v-model="form.category"
              :items="incomeCategories"
              label="カテゴリ"
              placeholder="カテゴリ"
              variant="outlined"
            />

            <!-- 金額入力 -->
            <v-text-field
              v-model.number="form.amount"
              type="number"
              label="金額"
              placeholder="例）300000"
              variant="outlined"
            />
          </div>

          <!-- メモ -->
          <v-text-field
            v-model="form.note"
            lebel="メモ（任意）"
            placeholder="任意"
            variant="outlined"
            
            
          />

          <!-- 保存ボタン -->
          <v-btn
            block
            size="large"
            :disabled="!canSave"
            @click="saveIncome"
          >
            保存
          </v-btn>

          <div v-if="message" class="text-center text-success mt-3">
            {{ message }}
          </div>
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
import Mixin from "../../mixin.js/mixin"
export default {
  name: "IncomeForm",
  mixins: [Mixin],
  data () {
    const { year, month } = this.getCurrentYearMonth()
    return {
      year,
      month,
      monthPickerOpen: false,
      form: {
        amount: null,
        category: "給与",
        note: ""
      },
      incomes: [],
      message: "",
      incomeCategories: ["給与","ボーナス","副業","臨時収入","その他"]
    }
  },
  mounted() {
    const saved = localStorage.getItem("income_v1")
    this.incomes = saved ? JSON.parse(saved) : []
  },
  watch: {
    incomes: {
      deep: true,
      handler (val) {
        localStorage.setItem("income_v1", JSON.stringify(val))
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
    // 金額合計
    monthKey () {
      // "2026-01" みたいな形式に統一
      const mm = String(this.month).padStart(2, "0")
      return `${this.year}-${mm}`
    },
    monthIncomes () {
      // 選択中の月だけ
      const now = new Date()
      return this.incomes.filter((x) => x.monthKey === this.monthKey).sort((a,b) => b.now === a.now)
    },
    monthTotal () {
      return this.monthIncomes.reduce((sum, x) => sum + (Number(x.amount) || 0), 0)
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
    // 登録内容保存
    saveIncome () {
      const item = {
        id: this.makeId(),
        monthKey: this.monthKey,
        amount: Number(this.form.amount),
        category: this.form.category,
        note: String(this.form.note ?? "").trim(),
        createdAt: Date.now()
      }
      console.log("item:", item)
      this.incomes.unshift(item)
      console.log("incomes[0]:", this.incomes[0]);
      console.log("length:", this.incomes.length);
      console.log("all:", this.incomes);
      console.log("保存されたアイテム:", item)
      this.form.amount = ""
      this.form.note = ""
      this.message = "保存完了"
      setTimeout(() => (this.message = ""), 1200)
    },
    // 削除アイコン
    removeIncome (id) {
      this.incomes = this.incomes.filter((x) => x.id !== id)
    },
    openMonthPicker() {
      this.monthPickerOpen = true
    }
  }
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
