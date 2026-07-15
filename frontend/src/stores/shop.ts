import { ref } from 'vue'

const shopEnabled = ref(true)

export function useShop() {
  return { shopEnabled }
}
