// 任务管理系统 - JavaScript 逻辑

// DOM元素
const taskTableBody = document.getElementById('task-table-body');
const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');
const cancelTask = document.getElementById('cancel-task');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');
const confirmModal = document.getElementById('confirm-modal');
const confirmContent = document.getElementById('confirm-content');
const cancelDelete = document.getElementById('cancel-delete');
const confirmDelete = document.getElementById('confirm-delete');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');
const closeToast = document.getElementById('close-toast');
const currentDate = document.getElementById('current-date');
const searchInput = document.getElementById('search-input');
const exportBtn = document.getElementById('export-btn');
const decreaseCount = document.getElementById('decrease-count');
const increaseCount = document.getElementById('increase-count');
const countInput = document.getElementById('count');
const paginationContainer = document.getElementById('pagination-container');
const paginationNumbers = document.getElementById('pagination-numbers');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const showingStart = document.getElementById('showing-start');
const showingEnd = document.getElementById('showing-end');
const totalCount = document.getElementById('total-count');
const totalTasks = document.getElementById('total-tasks');
const completedTasks = document.getElementById('completed-tasks');
const incompleteTasks = document.getElementById('incomplete-tasks');

// 全局变量
let tasks = [];
let filteredTasks = [];
let currentPage = 1;
let tasksPerPage = 5;
let editingTaskId = null;
let deletingTaskId = null;

// 初始化
function init() {
  // 设置当前日期
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  currentDate.textContent = now.toLocaleDateString('zh-CN', options);
  
  // 从本地存储加载任务
  loadTasks();
  
  // 绑定事件监听
  bindEvents();
  
  // 初始化分页
  updatePagination();
}

// 从本地存储加载任务
function loadTasks() {
  const savedTasks = localStorage.getItem('taskManagerTasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    filteredTasks = [...tasks];
    renderTasks();
    updateStats();
  }
}

// 保存任务到本地存储
function saveTasks() {
  localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
  updateStats();
}

// 绑定事件监听
function bindEvents() {
  // 添加任务按钮
  addTaskBtn.addEventListener('click', openAddTaskModal);
  
  // 关闭模态框
  closeModal.addEventListener('click', closeTaskModal);
  cancelTask.addEventListener('click', closeTaskModal);
  
  // 任务表单提交
  taskForm.addEventListener('submit', handleTaskFormSubmit);
  
  // 确认删除
  cancelDelete.addEventListener('click', closeConfirmModal);
  confirmDelete.addEventListener('click', handleDeleteTask);
  
  // 关闭提示消息
  closeToast.addEventListener('click', hideToast);
  
  // 搜索输入
  searchInput.addEventListener('input', handleSearch);
  
  // 导出数据
  exportBtn.addEventListener('click', exportTasks);
  
  // 调整次数
  decreaseCount.addEventListener('click', () => {
    if (countInput.value > 0) {
      countInput.value = parseInt(countInput.value) - 1;
    }
  });
  
  increaseCount.addEventListener('click', () => {
    countInput.value = parseInt(countInput.value) + 1;
  });
  
  // 分页控制
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updatePagination();
    }
  });
  
  nextPageBtn.addEventListener('click', () => {
    if (currentPage < getTotalPages()) {
      currentPage++;
      updatePagination();
    }
  });
}

// 打开添加任务模态框
function openAddTaskModal() {
  modalTitle.textContent = '添加任务';
  editingTaskId = null;
  
  // 清空表单
  document.getElementById('xianyu').value = '';
  document.getElementById('wechat').value = '';
  document.getElementById('count').value = 0;
  document.getElementById('done').value = '是';
  document.getElementById('remark').value = '';
  
  // 显示模态框
  taskModal.classList.remove('hidden');
  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  }, 10);
}

// 关闭任务模态框
function closeTaskModal() {
  modalContent.classList.remove('scale-100', 'opacity-100');
  modalContent.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    taskModal.classList.add('hidden');
  }, 300);
}

// 处理任务表单提交
function handleTaskFormSubmit(e) {
  e.preventDefault();
  
  const xianyu = document.getElementById('xianyu').value.trim();
  const wechat = document.getElementById('wechat').value.trim();
  const count = parseInt(document.getElementById('count').value);
  const done = document.getElementById('done').value;
  const remark = document.getElementById('remark').value.trim();
  
  if (!xianyu && !wechat) {
    showToast('请至少填写咸鱼或微信账号', 'error');
    return;
  }
  
  const taskData = {
    id: editingTaskId || Date.now().toString(),
    xianyu,
    wechat,
    count,
    done,
    remark,
    createdAt: editingTaskId ? tasks.find(t => t.id === editingTaskId).createdAt : new Date().toISOString()
  };
  
  if (editingTaskId) {
    // 更新任务
    const index = tasks.findIndex(t => t.id === editingTaskId);
    if (index !== -1) {
      tasks[index] = taskData;
      filteredTasks = [...tasks];
      saveTasks();
      renderTasks();
      showToast('任务更新成功', 'success');
    }
  } else {
    // 添加新任务
    tasks.unshift(taskData);
    filteredTasks = [...tasks];
    saveTasks();
    renderTasks();
    showToast('任务添加成功', 'success');
  }
  
  closeTaskModal();
}

// 打开编辑任务模态框
function openEditTaskModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  modalTitle.textContent = '编辑任务';
  editingTaskId = taskId;
  
  // 填充表单
  document.getElementById('xianyu').value = task.xianyu;
  document.getElementById('wechat').value = task.wechat;
  document.getElementById('count').value = task.count;
  document.getElementById('done').value = task.done;
  document.getElementById('remark').value = task.remark;
  
  // 显示模态框
  taskModal.classList.remove('hidden');
  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  }, 10);
}

// 打开确认删除模态框
function openConfirmDeleteModal(taskId) {
  deletingTaskId = taskId;
  
  // 显示模态框
  confirmModal.classList.remove('hidden');
  setTimeout(() => {
    confirmContent.classList.remove('scale-95', 'opacity-0');
    confirmContent.classList.add('scale-100', 'opacity-100');
  }, 10);
}

// 关闭确认删除模态框
function closeConfirmModal() {
  confirmContent.classList.remove('scale-100', 'opacity-100');
  confirmContent.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    confirmModal.classList.add('hidden');
  }, 300);
}

// 处理删除任务
function handleDeleteTask() {
  if (deletingTaskId) {
    tasks = tasks.filter(t => t.id !== deletingTaskId);
    filteredTasks = [...tasks];
    saveTasks();
    renderTasks();
    showToast('任务已删除', 'success');
  }
  closeConfirmModal();
}

// 渲染任务列表
function renderTasks() {
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
  
  if (paginatedTasks.length === 0) {
    taskTableBody.innerHTML = `
      <tr class="text-center">
        <td colspan="7" class="px-6 py-12 text-gray-500">
          <div class="flex flex-col items-center">
            <i class="fa fa-folder-open-o text-5xl text-gray-300 mb-4"></i>
            <p>暂无任务，请点击"添加任务"按钮创建新任务</p>
          </div>
        </td>
      </tr>
    `;
  } else {
    taskTableBody.innerHTML = paginatedTasks.map((task, index) => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${startIndex + index + 1}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${task.xianyu || '-'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${task.wechat || '-'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <div class="flex items-center justify-center">
            <button onclick="decreaseTaskCount('${task.id}')" class="p-1 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <i class="fa fa-minus text-xs"></i>
            </button>
            <span class="px-2 py-1 border-y border-gray-300">${task.count}</span>
            <button onclick="increaseTaskCount('${task.id}')" class="p-1 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <i class="fa fa-plus text-xs"></i>
            </button>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 py-1 text-xs font-medium rounded-full ${task.done === '是' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            ${task.done}
          </span>
        </td>
        <td class="px-6 py-4 text-sm text-gray-900">
          ${task.remark || '-'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
          <button onclick="openEditTaskModal('${task.id}')" class="text-primary hover:text-primary/80 mr-3 transition-colors">
            <i class="fa fa-pencil"></i>
          </button>
          <button onclick="openConfirmDeleteModal('${task.id}')" class="text-danger hover:text-danger/80 transition-colors">
            <i class="fa fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }
  
  // 更新分页信息
  updatePaginationInfo();
}

// 减少任务次数
window.decreaseTaskCount = function(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task && task.count > 0) {
    task.count--;
    saveTasks();
    renderTasks();
  }
};

// 增加任务次数
window.increaseTaskCount = function(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.count++;
    saveTasks();
    renderTasks();
  }
};

// 打开编辑任务模态框（window作用域以便在HTML中调用）
window.openEditTaskModal = openEditTaskModal;

// 打开确认删除模态框（window作用域以便在HTML中调用）
window.openConfirmDeleteModal = openConfirmDeleteModal;

// 处理搜索
function handleSearch() {
  const query = searchInput.value.toLowerCase().trim();
  
  if (!query) {
    filteredTasks = [...tasks];
  } else {
    filteredTasks = tasks.filter(task => 
      task.xianyu.toLowerCase().includes(query) || 
      task.wechat.toLowerCase().includes(query) || 
      task.remark.toLowerCase().includes(query)
    );
  }
  
  currentPage = 1; // 重置到第一页
  renderTasks();
  updatePagination();
}

// 导出任务数据
function exportTasks() {
  if (tasks.length === 0) {
    showToast('没有任务数据可导出', 'info');
    return;
  }
  
  // 创建CSV内容
  let csvContent = "序号,咸鱼,微信,执行次数,本周是否完成,备注\n";
  
  tasks.forEach((task, index) => {
    csvContent += `${index + 1},"${task.xianyu || ''}","${task.wechat || ''}",${task.count},"${task.done}","${task.remark || ''}"\n`;
  });
  
  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `任务数据_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast('数据导出成功', 'success');
}

// 显示提示消息
function showToast(message, type = 'info') {
  toastMessage.textContent = message;
  
  // 设置图标和样式
  if (type === 'success') {
    toastIcon.className = 'fa fa-check-circle text-success';
    toast.classList.add('border-success/20');
    toast.classList.remove('border-danger/20', 'border-info/20');
  } else if (type === 'error') {
    toastIcon.className = 'fa fa-times-circle text-danger';
    toast.classList.add('border-danger/20');
    toast.classList.remove('border-success/20', 'border-info/20');
  } else {
    toastIcon.className = 'fa fa-info-circle text-info';
    toast.classList.add('border-info/20');
    toast.classList.remove('border-success/20', 'border-danger/20');
  }
  
  // 显示提示
  toast.classList.remove('translate-x-full');
  
  // 自动隐藏
  setTimeout(() => {
    hideToast();
  }, 3000);
}

// 隐藏提示消息
function hideToast() {
  toast.classList.add('translate-x-full');
}

// 获取总页数
function getTotalPages() {
  return Math.ceil(filteredTasks.length / tasksPerPage);
}

// 更新分页信息
function updatePaginationInfo() {
  const total = filteredTasks.length;
  const start = (currentPage - 1) * tasksPerPage + 1;
  const end = Math.min(currentPage * tasksPerPage, total);
  
  showingStart.textContent = total > 0 ? start : 0;
  showingEnd.textContent = end;
  totalCount.textContent = total;
  
  // 更新统计卡片
  totalTasks.textContent = tasks.length;
  completedTasks.textContent = tasks.filter(t => t.done === '是').length;
  incompleteTasks.textContent = tasks.filter(t => t.done === '否').length;
}

// 更新统计信息
function updateStats() {
  totalTasks.textContent = tasks.length;
  completedTasks.textContent = tasks.filter(t => t.done === '是').length;
  incompleteTasks.textContent = tasks.filter(t => t.done === '否').length;
}

// 更新分页
function updatePagination() {
  const totalPages = getTotalPages();
  
  // 清空页码
  paginationNumbers.innerHTML = '';
  
  // 生成页码
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `px-3 py-1 border border-gray-300 rounded-md mx-1 bg-white text-gray-700 hover:bg-gray-50 transition-all-300 ${i === currentPage ? 'bg-primary text-white border-primary' : ''}`;
    pageBtn.textContent = i;
    
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderTasks();
      updatePagination();
    });
    
    paginationNumbers.appendChild(pageBtn);
  }
  
  // 禁用/启用上一页和下一页按钮
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
  
  // 显示/隐藏分页容器
  if (totalPages <= 1) {
    paginationContainer.classList.add('hidden');
  } else {
    paginationContainer.classList.remove('hidden');
  }
  
  // 渲染任务
  renderTasks();
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);    
