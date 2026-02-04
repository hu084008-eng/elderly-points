<template>
  <div class="exchange-page">
    <el-row :gutter="20">
      <!-- 左侧：人员选择 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>人员选择</span>
          </template>
          
          <el-form label-width="80px">
            <el-form-item label="人员类型">
              <el-radio-group v-model="selectedType" @change="handleTypeChange">
                <el-radio-button label="helper">护工</el-radio-button>
                <el-radio-button label="elderly">老人</el-radio-button>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="所属院">
              <el-input :value="userStore.userInstitution?.name" disabled />
            </el-form-item>
            
            <el-form-item label="具体人员">
              <el-select
                v-model="selectedPersonId"
                placeholder="请选择人员"
                style="width: 100%"
                filterable
                :loading="personLoading"
                @change="handlePersonChange"
              >
                <el-option
                  v-for="item in personList"
                  :key="item.id"
                  :label="`${item.name} - 余额${item.total_points}分`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
          
          <div v-if="selectedPerson" class="person-info">
            <el-divider />
            <div class="balance-display">
              <div class="balance-label">当前可用积分</div>
              <div class="balance-value">{{ selectedPerson.total_points }}分</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：商品选择 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>商品选择</span>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索商品"
                style="width: 200px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col
              v-for="product in filteredProducts"
              :key="product.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
              style="margin-bottom: 20px"
            >
              <el-card
                :class="{ 'out-of-stock': product.stock_quantity === 0 }"
                shadow="hover"
              >
                <div class="product-image">
                  <el-icon :size="40"><Goods /></el-icon>
                </div>
                <div class="product-name">{{ product.name }}</div>
                <div class="product-points">
                  <span class="points-value">{{ product.points_price }}</span> 分/{{ product.unit }}
                </div>
                <div class="product-stock" :class="{ 'low-stock': product.stock_quantity <= 5 }">
                  库存：{{ product.stock_quantity }}{{ product.unit }}
                </div>
                <el-input-number
                  v-model="cart[product.id]"
                  :min="0"
                  :max="product.stock_quantity"
                  :disabled="product.stock_quantity === 0 || !selectedPerson"
                  style="width: 100%; margin-top: 10px"
                  @change="(val) => handleQuantityChange(product.id, val)"
                />
                <div v-if="product.stock_quantity === 0" class="out-of-stock-tag">
                  缺货
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 底部：购物车汇总 -->
    <el-card v-if="cartItems.length > 0" class="cart-summary">
      <template #header>
        <span>购物车汇总</span>
      </template>
      
      <el-table :data="cartItems" border size="small">
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            {{ row.points_price * row.quantity }}分
          </template>
        </el-table-column>
      </el-table>
      
      <div class="cart-total">
        <div class="total-line">
          <span>总计所需积分：</span>
          <span class="total-points">{{ totalPoints }}分</span>
        </div>
        <div v-if="selectedPerson" class="balance-line">
          <span>当前余额{{ selectedPerson.total_points }}分 - 所需{{ totalPoints }}分 = </span>
          <span :class="remainingPoints >= 0 ? 'success' : 'danger'">
            剩余{{ remainingPoints }}分
          </span>
        </div>
        <el-alert
          v-if="selectedPerson && remainingPoints < 0"
          title="积分不足，无法兑换"
          type="error"
          :closable="false"
          show-icon
          style="margin-top: 10px"
        />
      </div>
      
      <div class="cart-actions">
        <el-button @click="handleClearCart">清空购物车</el-button>
        <el-button
          type="primary"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          确认兑换
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getProductList } from '@/api/products'
import { getHelpersByInstitution } from '@/api/helpers'
import { getElderlyByInstitution } from '@/api/elderly'
import { exchange } from '@/api/exchange'

const userStore = useUserStore()

const selectedType = ref('helper')
const selectedPersonId = ref(null)
const selectedPerson = ref(null)
const personList = ref([])
const productList = ref([])
const cart = reactive({})
const searchKeyword = ref('')
const personLoading = ref(false)

// 过滤后的商品列表
const filteredProducts = computed(() => {
  let products = productList.value.filter(p => p.status === 1 && p.stock_quantity > 0)
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    products = products.filter(p => p.name.toLowerCase().includes(keyword))
  }
  return products
})

// 购物车商品列表
const cartItems = computed(() => {
  return Object.entries(cart)
    .filter(([_, quantity]) => quantity > 0)
    .map(([productId, quantity]) => {
      const product = productList.value.find(p => p.id === parseInt(productId))
      return {
        product_id: parseInt(productId),
        name: product?.name,
        unit: product?.unit,
        quantity,
        points_price: product?.points_price
      }
    })
})

// 总计积分
const totalPoints = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.points_price * item.quantity, 0)
})

// 剩余积分
const remainingPoints = computed(() => {
  if (!selectedPerson.value) return 0
  return selectedPerson.value.total_points - totalPoints.value
})

// 是否可以提交
const canSubmit = computed(() => {
  return selectedPerson.value && 
         cartItems.value.length > 0 && 
         remainingPoints.value >= 0
})

const fetchProducts = async () => {
  try {
    const res = await getProductList()
    productList.value = res.data
  } catch (error) {
    console.error('获取商品失败:', error)
  }
}

const fetchPersons = async () => {
  personLoading.value = true
  try {
    const institutionId = userStore.userInstitution?.id
    let res
    if (selectedType.value === 'helper') {
      res = await getHelpersByInstitution(institutionId)
    } else {
      res = await getElderlyByInstitution(institutionId)
    }
    personList.value = res.data
  } finally {
    personLoading.value = false
  }
}

const handleTypeChange = () => {
  selectedPersonId.value = null
  selectedPerson.value = null
  handleClearCart()
  fetchPersons()
}

const handlePersonChange = (val) => {
  selectedPerson.value = personList.value.find(p => p.id === val)
}

const handleQuantityChange = (productId, val) => {
  if (val === 0) {
    delete cart[productId]
  }
}

const handleClearCart = () => {
  Object.keys(cart).forEach(key => delete cart[key])
}

const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm(
      `确认扣除${totalPoints.value}积分兑换这些商品？`,
      '确认兑换',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const items = cartItems.value.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }))
    
    const res = await exchange({
      target_type: selectedType.value,
      target_id: selectedPersonId.value,
      items
    })
    
    ElMessage.success(`兑换成功，${res.data.target_name}剩余积分${res.data.current_balance}分`)
    
    // 刷新数据
    handleClearCart()
    fetchPersons()
    fetchProducts()
    selectedPersonId.value = null
    selectedPerson.value = null
  } catch (error) {
    if (error !== 'cancel') {
      console.error('兑换失败:', error)
    }
  }
}

onMounted(() => {
  fetchProducts()
  fetchPersons()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.person-info {
  text-align: center;
}

.balance-display {
  padding: 20px;
}

.balance-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.balance-value {
  font-size: 36px;
  font-weight: bold;
  color: #67c23a;
}

.product-image {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 10px;
}

.product-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.product-points {
  color: #f56c6c;
  font-size: 12px;
  margin-bottom: 5px;
}

.points-value {
  font-size: 18px;
  font-weight: bold;
}

.product-stock {
  font-size: 12px;
  color: #909399;
}

.low-stock {
  color: #f56c6c;
}

.out-of-stock {
  opacity: 0.6;
}

.out-of-stock-tag {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 5px 15px;
  border-radius: 4px;
  font-size: 14px;
}

.cart-summary {
  margin-top: 20px;
}

.cart-total {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.total-line {
  font-size: 16px;
  margin-bottom: 10px;
}

.total-points {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.balance-line {
  font-size: 14px;
  color: #606266;
}

.balance-line .success {
  color: #67c23a;
  font-weight: bold;
}

.balance-line .danger {
  color: #f56c6c;
  font-weight: bold;
}

.cart-actions {
  margin-top: 20px;
  text-align: right;
}
</style>
