<template>
  <v-container class="container">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <!-- 入力フォーム -->
        <v-card class="inputCard" elevation="3" rounded="xl">
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

          <div v-if="message" class="messageText">
            {{ message }}
          </div>
        </v-card>

        <!-- 明細リスト -->
        <v-card class="incomeListCard" elevation="3" rounded="xl">
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

          <v-list v-if="monthIncomes.length" class="incomeListItems">
            <v-list-item v-for="it in monthIncomes" :key="it.id">
              <v-list-item-title class="flex">
                <span>{{ it.category }} <span class="noteItems">- {{ it.note }}</span></span>
                <span class="font-weight-bold">{{ formatYen(it.amount) }} 円</span>
              </v-list-item-title>

              <v-list-item-subtitle>
                登録日 {{ formatDate(it.createdAt) }}
              </v-list-item-subtitle>

              <!-- <template #append>
                <v-btn icon="mdi-delete" variant="text" color="red" @click.stop="removeIncome(it.id)"/>
              </template> -->
              <template #append>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="red"
                  @click.stop="openDeleteDialog(it.id)"
                />
              </template>
            </v-list-item>
          </v-list>

          <div v-else class="text-center text-medium-emphasis">
            収入が登録されていません
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

    <v-dialog v-model="deleteDialogOpen" max-width="420">
      <v-card class="pa-4" rounded="xl">
        <v-card-title class="text-h6 font-weight-bold">削除確認</v-card-title>

        <v-card-text>
          この収入を削除しますか？<br />
          （削除すると元に戻せません）
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="closeDeleteDialog">キャンセル</v-btn>
          <v-btn color="red" variant="flat" @click="confirmDelete">削除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script>
import Mixin from "../../mixin.js/mixin"
import localStorageSync from "../../mixin.js/localStorageSync"
export default {
  name: "IncomeForm",
  mixins: [Mixin, localStorageSync],
  data () {
    const { year, month } = this.getCurrentYearMonth()
    return {
      year,
      month,
      deleteDialogOpen: false,
      deleteTargetId: null,
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
    this.startLocalStorageSync("income_v1", "incomes", [])
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
    // removeIncome (id) {
    //   this.incomes = this.incomes.filter((x) => x.id !== id)
    // },
    openMonthPicker() {
      this.monthPickerOpen = true
    },
    openDeleteDialog(id) {
      this.deleteTargetId = id
      this.deleteDialogOpen = true
    },
    closeDeleteDialog() {
      this.deleteDialogOpen = false
      this.deleteTargetId = null
    },
    confirmDelete() {
      if (!this.deleteTargetId) return
      this.incomes = this.incomes.filter(x => x.id !== this.deleteTargetId)
      this.closeDeleteDialog()

      // this.message = "削除しました"
      // setTimeout(() => (this.message = ""), 1200)
    },
  }
}
</script>

<style scoped>
.container {
  padding: 8px 12px 180px;
  height: 100dvh;
  background-color: transparent;
}
.flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.inputCard {
  /* pa-4 mt-4 */
  padding: 16px;
  /* background:
    radial-gradient(900px 500px at 15% 10%, rgba(171, 156, 217, 0.22), transparent 55%),
    radial-gradient(900px 500px at 85% 25%, rgba(113, 177, 204, 0.18), transparent 55%),
    linear-gradient(180deg, rgba(227, 228, 237, 0.98), rgba(15, 16, 26, 0.98)); */
    background: rgba(116, 121, 140, 0.674);
    color: aliceblue;
}
.incomeListCard {
  padding: 16px;
  background: rgba(116, 121, 140, 0.674);
  margin-top: 12px;
  color: aliceblue;
}
.incomeListItems {
  background: rgba(116, 121, 140, 0.674);
  color: aliceblue;
  border-radius: 20px;
}
.noteItems {
  color: aliceblue;
}
.messageText {
  /* "text-center text-success mt-3 */
  text-align: center;
  margin: 8px;
  color: rgb(63, 137, 210);
}
</style>
