const mongoose = require('mongoose')

const ruleSchema = new mongoose.Schema({
  id:     { type: String },
  label:  { type: String },
  detail: { type: String },
}, { _id: false })

const analysisResultSchema = new mongoose.Schema({
  isOdd:          { type: Boolean },
  label:          { type: String },
  type:           { type: String },
  rules:          [ruleSchema],
  suggestion:     { type: String },
  resourceImpact: { type: String },
  coverageGap:    [Number],
}, { _id: false })

const schoolSchema = new mongoose.Schema({
  udise:          { type: String, required: true, trim: true },
  schoolName:     { type: String, required: true, trim: true },
  district:       { type: String, trim: true },
  state:          { type: String, trim: true },
  studentCount:   { type: Number },
  startGrade:     { type: Number, required: true },
  endGrade:       { type: Number, required: true },
  analysisResult: { type: analysisResultSchema },
  submittedAt:    { type: Date, default: Date.now },
})

module.exports = mongoose.model('School', schoolSchema)
