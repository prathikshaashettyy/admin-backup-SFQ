import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { FlatpickrOptions } from 'ng2-flatpickr';

import { AccountSettingsService } from 'app/main/pages/account-settings/account-settings.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountSettingsComponent implements OnInit, OnDestroy {
  // public
  public contentHeader: object;
  public data: any;
  public birthDateOptions: FlatpickrOptions = {
    altInput: true
  };
  public passwordTextTypeOld = false;
  public passwordTextTypeNew = false;
  public passwordTextTypeRetype = false;
  public avatarImage: string;
  public accountForm: FormGroup;

  // private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {AccountSettingsService} _accountSettingsService
   */
  constructor(private _accountSettingsService: AccountSettingsService, private _formBuilder: FormBuilder, private router: Router) {
    this._unsubscribeAll = new Subject();
    this.accountForm = this._formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', Validators.required],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ]

    });
  }




  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle Password Text Type Old
   */
  togglePasswordTextTypeOld() {
    this.passwordTextTypeOld = !this.passwordTextTypeOld;
  }

  /**
   * Toggle Password Text Type New
   */
  togglePasswordTextTypeNew() {
    this.passwordTextTypeNew = !this.passwordTextTypeNew;
  }

  /**
   * Toggle Password Text Type Retype
   */
  togglePasswordTextTypeRetype() {
    this.passwordTextTypeRetype = !this.passwordTextTypeRetype;
  }

  /**
   * Upload Image
   *
   * @param event
   */
  uploadImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();

      reader.onload = (event: any) => {
        this.avatarImage = event.target.result;
      };

      reader.readAsDataURL(event.target.files[0]);
    }
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {

    this._accountSettingsService.getUser().then((res) => {
      if (res) {

        this.accountForm.patchValue({
          firstName: res?.data?.firstName,
          lastName: res?.data?.lastName,
          email: res?.data?.email,
          phone: res?.data?.mobileNo,

        })
      }
    })
    this._accountSettingsService.onSettingsChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      this.data = response;
      // this.avatarImage = this.data.accountSetting.general.avatar;
    });

    // content header
    this.contentHeader = {
      headerTitle: 'Account Settings',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/'
          },
          {
            name: 'Pages',
            isLink: true,
            link: '/'
          },
          {
            name: 'Account Settings',
            isLink: false
          }
        ]
      }
    };
  }


  get firstName(): AbstractControl | null {
    return this.accountForm.get('firstName');
  }
  get lastName(): AbstractControl | null {
    return this.accountForm.get('lastName');
  }
  get phone(): AbstractControl | null {
    return this.accountForm.get('phone');
  }
  get email(): AbstractControl | null {
    return this.accountForm.get('email');
  }

  onSubmit() {
    if (this.accountForm.valid) {

      const data = {
        id: this._accountSettingsService.user.id,
        firstName: this.accountForm.value.firstName,
        lastName: this.accountForm.value.lastName,
        mobileNo: parseInt(this.accountForm.value.phone),
        email: this.accountForm.value.email,
        // password: this.accountForm.value.password,
        // roleId: 0,
        // isSubscribed: false,
      };
      this._accountSettingsService
        .updateUser(data).then((res) => {
          if (res) {
            if (res.statusCode == '200') {
              Swal.fire({
                title: '',
                text: 'Account updated successfully',
              })
            }
          }
          else {
            Swal.fire({
              title: '',
              text: res.message,
            })
          }
        });
    }


  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
