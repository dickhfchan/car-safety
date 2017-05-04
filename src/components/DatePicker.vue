<template>
  <div class="date-picker">
          <div class="input-wrapper" style="border:none;" @mouseenter="showCancel = true" @mouseleave="showCancel = false">
              <input class="input" @click="togglePanel" :value="range ? value[0] + ' -- ' + value[1] : value" readonly="readonly" style="width:165px;" />
          </div>
          <transition name="toggle">
              <div class="date-panel" v-show="panelState" style="right: 0;">
                  <div class="panel-header" v-show="panelType !== 'year'">
                      <div class="arrow-left" @click="prevMonthPreview()">&lt;</div>
                      <div class="year-month-box">
                          <div class="year-box" @click="chType('year')" v-text="tmpYear"></div>
                          <div class="month-box" @click="chType('month')">{{tmpMonth + 1 | month(language)}}</div>
                      </div>
                      <div class="arrow-right" @click="nextMonthPreview()">&gt;</div>
                  </div>
                  <div class="panel-header" v-show="panelType === 'year'">
                      <div class="arrow-left" @click="chYearRange(0)">&lt;</div>
                      <div class="year-range">
                          <span v-text="yearList[0]"></span> - <span v-text="yearList[yearList.length - 1]"></span>
                      </div>
                      <div class="arrow-right" @click="chYearRange(1)">&gt;</div>
                  </div>
                  <div class="type-year" v-show="panelType === 'year'">
                      <ul class="year-list">
                          <li v-for="item in yearList"
                              v-text="item"
                              :class="{selected: isSelected('year', item), invalid: validateYear(item)}"
                              @click="selectYear(item)"
                          >
                          </li>
                      </ul>
                  </div>
                  <div class="type-month" v-show="panelType === 'month'">
                      <ul class="month-list">
                          <li v-for="(item, index) in monthList"
                              :class="{selected: isSelected('month', index), invalid: validateMonth(index)}"
                              @click="selectMonth(index)"
                          >
                              {{item | month(language)}}
                          </li>
                      </ul>
                  </div>
                  <div class="type-date" v-show="panelType === 'date'">
                      <ul class="weeks">
                          <li v-for="item in weekList">{{item | week(language)}}</li>
                      </ul>
                      <ul class="date-list">
                          <li v-for="(item, index) in dateList"
                              :class="{preMonth: item.previousMonth, nextMonth: item.nextMonth,
                                  invalid: validateDate(item), firstItem: (index % 7) === 0}"
                              @click="selectDate(item)">
                              <div class="message" :class="{selected: isSelected('date', item)}">
                                  <div class="bg"></div><span v-text="item.value"></span>
                              </div>
                          </li>
                      </ul>
                  </div>
              </div>
          </transition>
      </div>
</template>
<script>
import DatePicker from 'vue-date'
export default {
  extends: DatePicker
}

</script>
