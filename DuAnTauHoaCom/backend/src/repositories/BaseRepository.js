const { Op } = require('sequelize')

class BaseRepository {
  constructor(model) {
    this.model = model
  }

  async findAll(options = {}) {
    return this.model.findAll(options)
  }

  async findById(id, options = {}) {
    return this.model.findByPk(id, options)
  }

  async findOne(where, options = {}) {
    return this.model.findOne({ where, ...options })
  }

  async create(data, options = {}) {
    return this.model.create(data, options)
  }

  async update(id, data, pkField = null) {
    const pk = pkField || this.model.primaryKeyAttribute
    const [count] = await this.model.update(data, { where: { [pk]: id } })
    return count
  }

  async updateWhere(where, data) {
    const [count] = await this.model.update(data, { where })
    return count
  }

  async delete(id, pkField = null) {
    const pk = pkField || this.model.primaryKeyAttribute
    return this.model.destroy({ where: { [pk]: id } })
  }

  async count(where = {}) {
    return this.model.count({ where })
  }

  async findAndCountAll(options = {}) {
    return this.model.findAndCountAll(options)
  }
}

module.exports = BaseRepository
