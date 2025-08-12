<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12">
        <h2 class="mb-4">Настройка полей для проектов и задач</h2>

        <!-- Табы -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <a class="nav-link" :class="{active: activeTab === 'projects'}"
               @click="activeTab = 'projects'">Проекты</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{active: activeTab === 'tasks'}"
               @click="activeTab = 'tasks'">Задачи</a>
          </li>
        </ul>

        <!-- Поля проектов -->
        <div v-if="activeTab === 'projects'">
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5>Доступные поля проектов</h5>
              <button class="btn btn-primary btn-sm" @click="showAddFieldModal('project')">
                <Plus size="16" class="me-1" /> Добавить поле
              </button>
            </div>

            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                  <tr>
                    <th style="width:40px;"></th>
                    <th>Название</th>
                    <th>Тип</th>
                    <th style="width:120px;">Действия</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(field, index) in projectFields"
                      :key="'project-'+(field.name)"
                      draggable="true"
                      @dragstart="onDragStart('projects', index)"
                      @dragover="onDragOver($event, 'projects', index)"
                      @drop="onDrop('projects', index)"
                      @dragend="onDragEnd"
                      :class="{'row-drag-over': draggingEntity==='projects' && dragOverIndex===index}">
                    <td class="align-middle">
                      <div class="drag-handle" title="Перетащите для изменения порядка">
                        <GripVertical size="18" />
                      </div>
                    </td>
                    <td class="align-middle">{{ field.label }}</td>
                    <td class="align-middle">{{ getFieldTypeName(field.type) }}</td>
                    <td class="align-middle">
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary" @click="editField('project', field)">
                          <Edit size="16" />
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteField('project', field)">
                          <Trash size="16" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        <!-- Поля задач -->
        <div v-if="activeTab === 'tasks'">
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5>Доступные поля задач</h5>
              <button class="btn btn-primary btn-sm" @click="showAddFieldModal('task')">
                <Plus size="16" class="me-1" /> Добавить поле
              </button>
            </div>

            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                  <tr>
                    <th style="width:40px;"></th>
                    <th>Название</th>
                    <th>Тип</th>
                    <th style="width:120px;">Действия</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(field, index) in taskFields"
                      :key="'task-'+(field.name)"
                      draggable="true"
                      @dragstart="onDragStart('tasks', index)"
                      @dragover="onDragOver($event, 'tasks', index)"
                      @drop="onDrop('tasks', index)"
                      @dragend="onDragEnd"
                      :class="{'row-drag-over': draggingEntity==='tasks' && dragOverIndex===index}">
                    <td class="align-middle">
                      <div class="drag-handle" title="Перетащите для изменения порядка">
                        <GripVertical size="18" />
                      </div>
                    </td>
                    <td class="align-middle">{{ field.label }}</td>
                    <td class="align-middle">{{ getFieldTypeName(field.type) }}</td>
                    <td class="align-middle">
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary" @click="editField('task', field)">
                          <Edit size="16" />
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteField('task', field)">
                          <Trash size="16" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- Модалка добавления/редактирования -->
    <div class="modal fade" id="fieldModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingField ? 'Редактировать поле' : 'Добавить новое поле' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveField">
              <div class="mb-3">
                <label class="form-label">Системное имя (латиница)</label>
                <input type="text" class="form-control" v-model="currentField.name"
                       :disabled="editingField" required pattern="[a-zA-Z0-9_]+"
                       placeholder="например, budget">
                <small class="text-muted">Только латинские буквы, цифры и подчёркивание</small>
              </div>
              <div class="mb-3">
                <label class="form-label">Отображаемое название</label>
                <input type="text" class="form-control" v-model="currentField.label" required placeholder="Бюджет">
              </div>
              <div class="mb-3">
                <label class="form-label">Тип поля</label>
                <select class="form-select" v-model="currentField.type" required>
                  <option v-for="type in fieldTypes" :key="type.value" :value="type.value">
                    {{ type.name }}
                  </option>
                </select>
              </div>
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Отмена</button>
                <button type="submit" class="btn btn-primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка удаления -->
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Подтверждение удаления</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Удалить поле <b>{{ fieldToDelete?.label }}</b>?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
            <button type="button" class="btn btn-danger" @click="deleteField">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
import FieldsSettingsApi from '@/modules/crm/project-management/js/fieldsSettingsApi.js'
import { Edit, Trash, Plus, GripVertical } from 'lucide-vue-next'

export default {
  name: 'FieldsSettings',
  components: { GripVertical, Edit, Trash, Plus },
  data() {
    return {
      activeTab: 'projects', // 'projects' | 'tasks'
      projectFields: [],
      taskFields: [],
      fieldTypes: [
        { value: 'text', name: 'Текст' },
        { value: 'number', name: 'Число' },
        { value: 'date', name: 'Дата' },
        { value: 'datetime', name: 'Дата и время' },
        { value: 'checkbox', name: 'Чекбокс' },
        { value: 'textarea', name: 'Текстовая область' },
      ],
      currentField: this.getEmptyField(),
      editingField: false,
      currentFieldEntity: 'project', // 'project' | 'task'
      fieldToDelete: null,
      deleteEntity: null,
      fieldModal: null,
      confirmDeleteModal: null,
      // DnD
      draggingIndex: null,
      draggingEntity: null,
      dragOverIndex: null,
    }
  },

  mounted() {
    this.fieldModal = new Modal(document.getElementById('fieldModal'))
    this.confirmDeleteModal = new Modal(document.getElementById('confirmDeleteModal'))
    this.loadFields()
  },

  methods: {
    getEmptyField() { return { name: '', label: '', type: 'text' } },

    onlyNeeded(list) {
      return list.map(({ name, label, type }) => ({ name, label, type }))
    },

    async replaceFor(entity, list) {
      const payload = this.onlyNeeded(list)
      if (entity === 'project') {
        return FieldsSettingsApi.replaceProjectFields(payload)
      }
      return FieldsSettingsApi.replaceTaskFields(payload)
    },

    async loadFields() {
      try {
        const [projRes, taskRes] = await Promise.all([
          FieldsSettingsApi.getProjectFields(),
          FieldsSettingsApi.getTaskFields(),
        ])
        const norm = (res) =>
          res?.data?.fields || res?.data?.results || (Array.isArray(res?.data) ? res.data : []) || []
        this.projectFields = norm(projRes)
        this.taskFields    = norm(taskRes)
      } catch (e) {
        console.error('Ошибка загрузки полей', e)
        this.$toast?.error?.('Не удалось загрузить список полей')
      }
    },

    showAddFieldModal(entity) {
      this.currentField = this.getEmptyField()
      this.editingField = false
      this.currentFieldEntity = entity // 'project' | 'task'
      this.fieldModal.show()
    },

    editField(entity, field) {
      this.currentField = { ...field }
      this.editingField = true
      this.currentFieldEntity = entity
      this.fieldModal.show()
    },

    async saveField() {
      const entity = this.currentFieldEntity
      const list = entity === 'project' ? [...this.projectFields] : [...this.taskFields]

      const name = (this.currentField.name || '').trim()
      const label = (this.currentField.label || '').trim()
      const type = this.currentField.type

      if (!name || !label) {
        this.$toast?.error?.('Заполните имя и название поля')
        return
      }

      if (this.editingField) {
        const idx = list.findIndex(f => f.name === this.currentField.name)
        if (idx !== -1) list[idx] = { name, label, type }
      } else {
        if (list.some(f => f.name === name)) {
          this.$toast?.error?.('Поле с таким системным именем уже существует')
          return
        }
        list.push({ name, label, type })
      }

      try {
        await this.replaceFor(entity, list)
        if (entity === 'project') this.projectFields = list
        else this.taskFields = list
        this.$toast?.success?.('Сохранено')
        this.fieldModal.hide()
      } catch (e) {
        console.error(e)
        this.$toast?.error?.('Ошибка сохранения поля')
      }
    },

    confirmDeleteField(entity, field) {
      this.fieldToDelete = field
      this.deleteEntity = entity
      this.confirmDeleteModal.show()
    },

    async deleteField() {
      if (!this.fieldToDelete) return
      const entity = this.deleteEntity
      const list = entity === 'project' ? [...this.projectFields] : [...this.taskFields]
      const idx = list.findIndex(f => f.name === this.fieldToDelete.name)
      if (idx === -1) return

      list.splice(idx, 1)
      try {
        await this.replaceFor(entity, list)
        if (entity === 'project') this.projectFields = list
        else this.taskFields = list
        this.$toast?.success?.('Поле удалено')
      } catch (e) {
        console.error(e)
        this.$toast?.error?.('Ошибка удаления поля')
      } finally {
        this.confirmDeleteModal.hide()
        this.fieldToDelete = null
        this.deleteEntity = null
      }
    },

    // --- Drag & Drop ---
    onDragStart(entity, index) {
      this.draggingEntity = entity   // 'projects' | 'tasks'
      this.draggingIndex = index
      this.dragOverIndex = null
    },
    onDragOver(e, entity, overIndex) {
      if (this.draggingEntity !== entity) return
      e.preventDefault()
      this.dragOverIndex = overIndex
    },
    async onDrop(entity, dropIndex) {
      if (this.draggingEntity !== entity || this.draggingIndex === null) return

      const list = entity === 'projects' ? [...this.projectFields] : [...this.taskFields]
      const from = this.draggingIndex
      const to = dropIndex
      if (from === to) { this.onDragEnd(); return }

      const [moved] = list.splice(from, 1)
      list.splice(to, 0, moved)

      // применяем локально
      if (entity === 'projects') this.projectFields = list
      else this.taskFields = list

      // сохраняем порядок одним replace*
      try {
        const entitySingular = entity === 'projects' ? 'project' : 'task'
        await this.replaceFor(entitySingular, list)
        this.$toast?.success?.('Порядок сохранён')
      } catch (e) {
        console.error(e)
        this.$toast?.error?.('Не удалось сохранить порядок')
      } finally {
        this.onDragEnd()
      }
    },
    onDragEnd() {
      this.draggingIndex = null
      this.dragOverIndex = null
      this.draggingEntity = null
    },

    getFieldTypeName(type) {
      const found = this.fieldTypes.find(t => t.value === type)
      return found ? found.name : type
    },
  }
}
</script>

<style scoped>
.btn { display: inline-flex; align-items: center; height: 30px; }
.nav-tabs .nav-link { cursor: pointer; }
.row-drag-over { outline: 2px dashed var(--bs-primary); background-color: rgba(13,110,253,.05); }
.drag-handle { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:6px; color:#6c757d; cursor:grab; user-select:none; }
.table-hover tbody tr:hover .drag-handle { background: rgba(0,0,0,.05); }
</style>
