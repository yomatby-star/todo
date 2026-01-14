export default {
  methods: {
    go(path) {
      this.$router.push(path)
    },

    getCurrentYearMonth() {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      };
    },

    formatDate(ts) {
      if (!ts) return "";
      const d = new Date(ts);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
    },

    makeId() {
      if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
      }
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    },

    yyyymmdd() {
      return new Date();
    },
    yyyymmddH() {
      return new Date();
    }
  }
}