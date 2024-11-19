import {Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MetaService} from '../service/meta.service';
import {DbConnInfo, DbType, Supports} from '../types/commType';
import {DbTypePipePipe} from '../pipes/db-type-pipe.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    DbTypePipePipe,
    ReactiveFormsModule
  ],
  template: `
    <div class="column mt-2 ">
      <div class="col-4 mx-auto shadow-sm p-2 ">

        <select class="form-select mb-2" aria-label="Default select example" [(ngModel)]="selectedValue"
                (change)="onSelect()">
          <option disabled selected>please select Db Type</option>
          @for (option of options(); track option) {
            <option [ngValue]="option">{{ option|dbTypePipe }}</option>
          }
        </select>
        <form [formGroup]="connInfoForm" (ngSubmit)="onLogin()">
          <div class="mb-3">
            <div class="input-group mb-2">
              <span class="input-group-text" id="basic-addon3">url</span>
              <input formControlName="url" [value]="sampleUrl" type="text" class="form-control" id="url"
                     aria-describedby="basic-addon3 basic-addon4">
            </div>
            <div class="input-group mb-2">
              <span class="input-group-text" id="basic-addon3">username</span>
              <input type="text" class="form-control" formControlName="username" id="username"
                     aria-describedby="basic-addon3 basic-addon4">
            </div>
            <div class="input-group mb-2">
              <span class="input-group-text" id="basic-addon3">password</span>
              <input type="text" class="form-control" id="password" formControlName="password"
                     aria-describedby="basic-addon3 basic-addon4">
            </div>
          </div>
          <button type="submit" [disabled]="connInfoForm.invalid" class="btn btn-primary">submit connection info
          </button>
        </form>
      </div>
      <div class="col-4 mx-auto bg-primary bg-opacity-10 shadow-sm p-2 mt-5">
        <p class="lead">
          本程序使用浏览器<span class="bg-info rounded">IndexedDB</span>保存第一次加载的数据<br>
          更新可以按橙字重载<br>
          <strong>数据库的访问：从后台程序所在的服务器发起访问</strong><br>
          <small>当前支持pg与mysql</small>
        </p>
      </div>
    </div>

  `,
  styles: `

  `
})
export class LoginComponent implements OnInit {

  router = inject(Router)
  options = signal([0, 1])
  selectedValue = 0;
  sampleUrl = ''
  supported: Supports[] = [];

  connInfoForm: FormGroup;

  constructor(private metaService: MetaService, private fb: FormBuilder) {
    this.connInfoForm = this.fb.group({
      dbType: new FormControl<DbType>(0, [Validators.required, Validators.minLength(1)]),
      url: new FormControl<string>('', [Validators.required, Validators.minLength(1)]),
      username: new FormControl<string>('postgres', [Validators.required, Validators.minLength(1)]),
      password: new FormControl<string>('admin123', [Validators.required, Validators.minLength(1)]),
    });
  }

  ngOnInit(): void {
    this.metaService.getSupports().subscribe({
      next: data => {
        this.supported = data;
        this.options.set(data.map(s => s.dbType))
        this.sampleUrl = data[0].sampleUrl;
        this.connInfoForm.patchValue({url: this.sampleUrl});
      },
    });
  }

  toDashboard() {
    this.router.navigate(['dashboard']);
  }

  onSelect() {
    this.metaService.connInfoSignal.update((pre) => {
      return {...pre, dbType: this.selectedValue} as DbConnInfo;
    })
    this.sampleUrl = this.supported[this.selectedValue].sampleUrl
    this.connInfoForm.patchValue({dbType: this.selectedValue, url: this.sampleUrl});
  }

  onLogin() {
    if (this.connInfoForm.valid) {
      let value = this.connInfoForm.value as DbConnInfo;
      this.metaService.connInfoSignal.set(value);
      this.toDashboard();
    } else {
      console.log('非法', this.connInfoForm)
    }
    console.log(this.metaService.connInfoSignal());
  }
}
