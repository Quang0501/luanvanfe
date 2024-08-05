import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Ebook } from '../../models/ebook';
import { EbookService } from '../../services/ebook.service';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';
import { EbookImage } from '../../models/ebook.image';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../../services/order.service';
import { TokenService } from '../../services/token.service';
import { EbookMp3 } from '../../models/ebook.mp3';
import { userInfo } from 'os';
import { LoveService } from '../../services/love.service';
import { OrderResponse } from '../../responses/order/order.response';
import { Order } from '../../models/order';
import { OrderStatusDetailDTO } from '../../dtos/order/order-status-detail.dto';
import { RoleService } from '../../services/role.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { UserResponse } from '../../responses/user/user.response';
import { useContainer } from 'class-validator';

@Component({
  selector: 'app-detail-ebook',
  templateUrl: './detail-ebook.component.html',
  styleUrls: ['./detail-ebook.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    NgbModule
  ]
})
export class DetailEbookComponent implements OnInit {
  ebook?: Ebook;
  order?: Order;
  user?: User;
  userResponse?: UserResponse;
  ebookId: number = 0;
  currentImageIndex: number = 0;
  currentMp3Index: number = 0;
  quantity: number = 1;
  isPressedAddToCart: boolean = false;
  isDocumentVisible: boolean = false;
  isAudioVisible = false;
  isPlaying = false;
  isLoved: boolean = false;
  isPressedAddToLove: boolean = false;
  orderId: number = 0;
  orders: OrderResponse[] = [];
  totalPages: number = 0;
  keyword: string = "";
  tokensv: string = "";
  isComplete: boolean= true;
  cartItemCount: number = 0; 

  allOrdersStatus: OrderStatusDetailDTO[] = [];

  constructor(
    private ebookService: EbookService,
    private cartService: CartService,
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private token: TokenService,
    private role: RoleService,
    private userService: UserService,
    private router: Router,
    private loveService: LoveService,
    private route: ActivatedRoute,

  ) { }

  ngOnInit() {
    //check ẩn button mua
    // this.checkBuyEbook();
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.ebookId = +idParam;
    }
    if (!isNaN(this.ebookId)) {
      this.ebookService.getDetailEbook(this.ebookId).subscribe({
        next: (response: any) => {
          if (response.ebook_images?.length > 0) {
            response.ebook_images.forEach((ebook_image: EbookImage) => {

              if (!ebook_image.image_url.startsWith(environment.apiBaseUrl)) {
                ebook_image.image_url = `${environment.apiBaseUrl}/ebooks/images/${ebook_image.image_url}`;
              }
            });
            if (response.ebook_mp3s.length > 0) {
              response.ebook_mp3s.forEach((ebook_mp3: EbookMp3) => {
                if (!ebook_mp3.mp3_url.startsWith(environment.apiBaseUrl)) {
                  ebook_mp3.mp3_url = `${environment.apiBaseUrl}/ebooks/audios/${ebook_mp3.mp3_url}`;
                }
              });

            }

          }
          this.ebook = response;
          this.showImage(0);
        },
        complete: () => {
          console.log('Fetch complete');
        },
        error: (error: any) => {
          console.error('Error fetching detail:', error);
        }
      });
    } else {
      console.error('Invalid ebookId:', idParam);
    }
  }

  showImage(index: number): void {
    if (this.ebook && this.ebook.ebook_images && this.ebook.ebook_images.length > 0) {
      if (index < 0) {
        index = 0;
      } else if (index >= this.ebook.ebook_images.length) {
        index = this.ebook.ebook_images.length - 1;
      }
      this.currentImageIndex = index;
    }
  }

  thumbnailClick(index: number) {
    this.currentImageIndex = index;
  }

  nextImage(): void {
    this.showImage(this.currentImageIndex + 1);
  }

  previousImage(): void {
    this.showImage(this.currentImageIndex - 1);
  }

  // addToCart(): void {
  //   this.isPressedAddToCart = true;
  //   if (!this.token.getUserId()) {
  //     this.isPlaying = false;
  //     alert('Bạn cần đăng nhập để thêm giỏ hàng.');
  //     this.router.navigate(['/login']);
  //   }
  //   else if (this.ebook?.price === 0) {
  //     alert('Đây là sách miễn phí.');
  //   }

  //   else if (this.ebook) {
  //     const cart = this.cartService.getCart();
  //     const maxCartSize = 10;

  //     if (this.cartService.isProductInCart(this.ebook.id)) {
  //       alert('Sản phẩm đã tồn tại trong giỏ hàng. Không thể thêm sản phẩm.');
  //       this.router.navigate(['/orders']);
  //     } else {
  //       this.cartService.addToCart(this.ebook.id, this.quantity);
  //       alert('Thêm sản phẩm vào giỏ thành công.');
  //       this.router.navigate(['/orders']);
  //     }
  //   } else {
  //     console.error('Không thể thêm sản phẩm vào giỏ hàng vì ebook là null.');
  //   }
  // }

  // addToCart(): void {
  //   this.isPressedAddToCart = true;

  //   // Kiểm tra xem người dùng đã đăng nhập chưa
  //   if (!this.token.getUserId()) {
  //     this.isPlaying = false;
  //     alert('Bạn cần đăng nhập để thêm giỏ hàng.');
  //     this.router.navigate(['/login']);
  //     return;
  //   }

  //   // Kiểm tra xem sách có miễn phí không
  //   if (this.ebook?.price === 0) {
  //     alert('Đây là sách miễn phí.');
  //     return;
  //   }

  //   // Kiểm tra trạng thái đơn hàng và thêm vào giỏ hàng
  //   this.orderService.getAllOrdersStatus().subscribe(
  //     (ordersStatus) => {
  //       const orderStatus = ordersStatus.find(status => status.ebook_id === this.ebookId);

  //       if (orderStatus) {
  //         if (orderStatus.status === 'COMPLETE') {
  //           alert('Bạn đã mua ebook này rồi.');
  //           return; 
  //         }
  //         if (orderStatus.status != 'COMPLETE') {
  //           if (this.ebook) {
  //             const cart = this.cartService.getCart();
  //             const maxCartSize = 10;

  //             if (this.cartService.isProductInCart(this.ebook.id)) {
  //               alert('Sản phẩm đã tồn tại trong giỏ hàng. Không thể thêm sản phẩm.');
  //               this.router.navigate(['/orders']);
  //             } else {
  //               this.cartService.addToCart(this.ebook.id, this.quantity);
  //               alert('Thêm sản phẩm vào giỏ thành công.');
  //               this.router.navigate(['/orders']);
  //             }
  //           } else {
  //             console.error('Không thể thêm sản phẩm vào giỏ hàng vì ebook là null.');
  //           }
  //         }

  //       }
  //       else if (this.ebook) {
  //         const cart = this.cartService.getCart();
  //         const maxCartSize = 10;

  //         if (this.cartService.isProductInCart(this.ebook.id)) {
  //           alert('Sản phẩm đã tồn tại trong giỏ hàng. Không thể thêm sản phẩm.');
  //           this.router.navigate(['/orders']);
  //         } else {
  //           this.cartService.addToCart(this.ebook.id, this.quantity);
  //           alert('Thêm sản phẩm vào giỏ thành công.');
  //           this.router.navigate(['/orders']);
  //         }
  //       } else {
  //         console.error('Không thể thêm sản phẩm vào giỏ hàng vì ebook là null.');
  //       }

  //     },
  //     (error) => {
  //       console.error('Error fetching orders status:', error);
  //       alert('Đã xảy ra lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại sau.');
  //     }
  //   );
  // }

  // addToCart(): void {
  //   this.isPressedAddToCart = true;

  //   // Kiểm tra xem người dùng đã đăng nhập chưa
  //   if (!this.token.getUserId()) {
  //     this.isPlaying = false;
  //     alert('Bạn cần đăng nhập để thêm giỏ hàng.');
  //     this.router.navigate(['/login']);
  //     return;
  //   }

  //   // Kiểm tra xem sách có miễn phí không
  //   if (this.ebook?.price === 0) {
  //     alert('Đây là sách miễn phí.');
  //     return;
  //   }

  //   // Kiểm tra trạng thái đơn hàng và thêm vào giỏ hàng
  //   this.orderService.getAllOrdersStatus().subscribe(
  //     (ordersStatus) => {
  //       const hasCompletedOrder = ordersStatus.some(
  //         status => status.ebook_id === this.ebookId && (status.status === 'COMPLETE' || status.status === 'Hoàn Thành')
  //       );
  //       // Tìm trạng thái đơn hàng của ebook hiện tại
  //       const orderStatus = ordersStatus.find(status => status.ebook_id === this.ebookId);

  //       // Nếu có trạng thái đơn hàng
  //       if (orderStatus) {
  //         // Nếu trạng thái đơn hàng là 'COMPLETE', không cho thêm vào giỏ hàng
  //         if (orderStatus.status === 'COMPLETE' ||orderStatus.status === 'Hoàn Thành' ) {
  //           alert('Bạn đã mua ebook này rồi.');
  //           return;
  //         }
  //         // Nếu trạng thái đơn hàng là 'CANCEL' hoặc 'PROCESSING', cho phép thêm vào giỏ hàng
  //         if (orderStatus.status === 'CANCEL' || orderStatus.status === 'PROCESSING') {
  //           this.addEbookToCart();
  //         }
  //       } else {
  //         // Nếu không có trạng thái đơn hàng nào, cho phép thêm vào giỏ hàng
  //         this.addEbookToCart();
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching orders status:', error);
  //       alert(`Đã xảy ra lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại sau. Chi tiết lỗi: ${error.message}`);
  //     }
  //   );
  // }

  // private addEbookToCart(): void {
  //   if (this.ebook) {
  //     const cart = this.cartService.getCart();
  //     const maxCartSize = 10;

  //     if (this.cartService.isProductInCart(this.ebook.id)) {
  //       alert('Sản phẩm đã tồn tại trong giỏ hàng. Không thể thêm sản phẩm.');
  //       this.router.navigate(['/orders']);
  //     } else {
  //       this.cartService.addToCart(this.ebook.id, this.quantity);
  //       alert('Thêm sản phẩm vào giỏ thành công.');
  //       this.router.navigate(['/orders']);
  //     }
  //   } else {
  //     console.error('Không thể thêm sản phẩm vào giỏ hàng vì ebook là null.');
  //   }
  // }

  addToCart(): void {
    this.isPressedAddToCart = true;

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!this.token.getUserId()) {
      this.isPlaying = false;
      alert('Bạn cần đăng nhập để thêm giỏ hàng.');
      this.router.navigate(['/login']);
      return;
    }

    // Kiểm tra xem sách có miễn phí không
    if (this.ebook?.price === 0) {
      alert('Đây là sách miễn phí.');
      return;
    }

    // Kiểm tra trạng thái đơn hàng và thêm vào giỏ hàng
    this.orderService.getAllOrdersStatus().subscribe(
      (ordersStatus) => {
        // Kiểm tra xem có đơn hàng nào chứa ebook_id với trạng thái 'COMPLETE'
        const hasCompletedOrder = ordersStatus.some(
          status => status.ebook_id === this.ebookId && (status.status === 'COMPLETE' || status.status === 'Hoàn Thành')
        );

        if (hasCompletedOrder) {
          // Nếu có trạng thái 'COMPLETE', không cho thêm vào giỏ hàng và hiển thị thông báo
          alert('Bạn đã mua ebook này rồi.');
          return;
        }

        // Nếu không có đơn hàng 'COMPLETE', kiểm tra trạng thái 'CANCEL' hoặc 'PROCESSING'
        const orderStatus = ordersStatus.find(status => status.ebook_id === this.ebookId);

        if (orderStatus && (orderStatus.status === 'CANCEL' || orderStatus.status === 'PROCESSING')) {
          this.addEbookToCart();
          location.reload();
        } else {
          // Nếu không có trạng thái đơn hàng nào, cho phép thêm vào giỏ hàng
          this.addEbookToCart();

          location.reload();
        }
      },
      (error) => {
        console.error('Error fetching orders status:', error);
        alert(`Đã xảy ra lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại sau. Chi tiết lỗi: ${error.message}`);
      }
    );
  }

  private addEbookToCart(): void {
    if (this.ebook) {
      const cart = this.cartService.getCart();
      const maxCartSize = 10;

      if (this.cartService.isProductInCart(this.ebook.id)) {
        alert('Sản phẩm đã tồn tại trong giỏ hàng. Không thể thêm sản phẩm.');
        // this.router.navigate(['/orders']);
      } else {
        this.cartService.addToCart(this.ebook.id, this.quantity);
        alert('Thêm sản phẩm vào giỏ thành công.');
        this.updateCartItemCount();
        // this.router.navigate(['/orders']);
        // location.reload();
      }
    } else {
      console.error('Không thể thêm sản phẩm vào giỏ hàng vì ebook là null.');
    }
    // location.reload();
  }


  private updateCartItemCount(): void {
    this.cartItemCount = this.cartService.getTotalItemCount();
  }


  // increaseQuantity(): void {
  //   this.quantity++;
  // }

  // decreaseQuantity(): void {
  //   if (this.quantity > 1) {
  //     this.quantity--;
  //   }
  // }

  buyNow(): void {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!this.token.getUserId()) {
      this.isPlaying = false;
      alert('Bạn cần đăng nhập để thực hiện mua ngay.');
      this.router.navigate(['/login']);
      return;
    }

    // Kiểm tra xem sách có miễn phí không
    if (this.ebook?.price === 0) {
      alert('Đây là sách miễn phí.');
      return;
    }

    // Kiểm tra trạng thái đơn hàng và thực hiện mua ngay
    this.orderService.getAllOrdersStatus().subscribe(
      (ordersStatus) => {
        // Kiểm tra xem có đơn hàng nào chứa ebook_id với trạng thái 'COMPLETE'
        const hasCompletedOrder = ordersStatus.some(
          status => status.ebook_id === this.ebookId && (status.status === 'COMPLETE' || status.status === 'Hoàn Thành')
        );

        if (hasCompletedOrder) {
          // Nếu có trạng thái 'COMPLETE', không cho phép mua ngay và hiển thị thông báo
          alert('Bạn đã mua ebook này rồi.');
          return;
        }

        // Nếu không có đơn hàng 'COMPLETE', kiểm tra trạng thái 'CANCEL' hoặc 'PROCESSING'
        const orderStatus = ordersStatus.find(status => status.ebook_id === this.ebookId);

        if (orderStatus && (orderStatus.status === 'CANCEL' || orderStatus.status === 'PROCESSING')) {
          this.addEbookToCart();
          // Điều hướng đến trang thanh toán sau khi thêm vào giỏ hàng
          this.router.navigate(['/orders']);
        } else {
          // Nếu không có trạng thái đơn hàng nào, cho phép thêm vào giỏ hàng và điều hướng đến thanh toán
          this.addEbookToCart();
          this.router.navigate(['/orders']);
        }
      },
      (error) => {
        console.error('Error fetching orders status:', error);
        alert(`Đã xảy ra lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại sau. Chi tiết lỗi: ${error.message}`);
      }
    );
  }


  // tất cả đều đọc được ebook 

  // toggleDocumentVisibility(): void {
  //   if (this.ebook?.price != 0 && !this.token.getUserId()) {
  //     this.isPlaying = false;
  //     alert('Bạn cần đăng nhập để đọc sách.');
  //   } 

  //   else {
  //     this.isDocumentVisible = !this.isDocumentVisible;
  //     if (this.isDocumentVisible) {
  //       // Ẩn phần audio khi hiển thị tài liệu
  //       this.isAudioVisible = false;
  //       // Ẩn toàn bộ container chứa các phần tử khác
  //       document.querySelector('.container')?.classList.add('hidden');
  //       // Hiển thị phần document
  //       document.querySelector('.document')?.classList.remove('hidden');
  //     } else {
  //       // Hiển thị lại các phần tử khác khi tài liệu không hiển thị
  //       document.querySelector('.container')?.classList.remove('hidden');
  //       // Ẩn phần document khi không hiển thị
  //       document.querySelector('.document')?.classList.add('hidden');
  //     }
  //   }
  // }

  // toggleDocumentVisibility(): void {
  //   // Kiểm tra xem sách có miễn phí hay không
  //   if (this.ebook?.price === 0) {
  //     // Nếu sách miễn phí, hiển thị hoặc ẩn tài liệu mà không cần kiểm tra trạng thái đơn hàng
  //     this.isDocumentVisible = !this.isDocumentVisible;
  //     // Ẩn hoặc hiện các phần tử khác trong giao diện
  //     if (this.isDocumentVisible) {
  //       this.isAudioVisible = false; // Ẩn phần audio khi hiển thị tài liệu
  //       document.querySelector('.container')?.classList.add('hidden');
  //       document.querySelector('.document')?.classList.remove('hidden');
  //     } else {
  //       document.querySelector('.container')?.classList.remove('hidden');
  //       document.querySelector('.document')?.classList.add('hidden');
  //     }
  //     return;
  //   }

  //   // Kiểm tra xem người dùng đã đăng nhập hay chưa
  //   if (this.ebook?.price !== 0 && !this.token.getUserId()) {
  //     this.isPlaying = false;
  //     alert('Bạn cần đăng nhập để đọc sách.');
  //     return;
  //   }

  //   // Lấy danh sách trạng thái đơn hàng
  //   this.orderService.getAllOrdersStatus().subscribe(
  //     (ordersStatus) => {
  //       // Kiểm tra trạng thái đơn hàng
  //       if (this.ebookId) {
  //         const orderStatus = ordersStatus.find(status => status.ebook_id === this.ebookId);

  //         if (orderStatus) {
  //           if (orderStatus.status === 'COMPLETE') {
  //             this.isDocumentVisible = !this.isDocumentVisible;
  //             // Ẩn hoặc hiện các phần tử khác trong giao diện
  //             if (this.isDocumentVisible) {
  //               this.isAudioVisible = false; // Ẩn phần audio khi hiển thị tài liệu
  //               document.querySelector('.container')?.classList.add('hidden');
  //               document.querySelector('.document')?.classList.remove('hidden');
  //             } else {
  //               document.querySelector('.container')?.classList.remove('hidden');
  //               document.querySelector('.document')?.classList.add('hidden');
  //             }
  //           } else if (orderStatus.status === 'PROCESSING') {
  //             alert('Đơn hàng của bạn đang xử lý. Bạn không thể đọc sách ngay bây giờ.');
  //           } else {
  //             alert('Trạng thái đơn hàng không xác định.');
  //           }
  //         } else {
  //           alert('Bạn chưa mua sách này.');
  //         }
  //       } else {
  //         alert('Thông tin sách không hợp lệ.');
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching orders status:', error);
  //       alert('Đã xảy ra lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại sau.');
  //     }
  //   );
  // }

  toggleDocumentVisibility(): void {
    // Kiểm tra xem sách có miễn phí hay không
    if (this.ebook?.price === 0) {
      this.isDocumentVisible = !this.isDocumentVisible;
      // Ẩn hoặc hiện các phần tử khác trong giao diện
      if (this.isDocumentVisible) {
        this.isAudioVisible = false; // Ẩn phần audio khi hiển thị tài liệu
        document.querySelector('.container')?.classList.add('hidden');
        document.querySelector('.document')?.classList.remove('hidden');
      } else {
        document.querySelector('.container')?.classList.remove('hidden');
        document.querySelector('.document')?.classList.add('hidden');
      }
      return;
    }

    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    if (this.ebook?.price !== 0 && !this.token.getUserId()) {
      this.isPlaying = false;
      alert('Bạn cần đăng nhập để đọc sách.');
      return;
    }

    this.checkRole().then(() => {
      if (this.userRole === 'admin') {
        this.isDocumentVisible = !this.isDocumentVisible;
        // Ẩn hoặc hiện các phần tử khác trong giao diện
        if (this.isDocumentVisible) {
          this.isAudioVisible = false; // Ẩn phần audio khi hiển thị tài liệu
          document.querySelector('.container')?.classList.add('hidden');
          document.querySelector('.document')?.classList.remove('hidden');
        } else {
          document.querySelector('.container')?.classList.remove('hidden');
          document.querySelector('.document')?.classList.add('hidden');
        }
        return;
      }



      // Lấy danh sách trạng thái đơn hàng
      this.orderService.getAllOrdersStatus().subscribe(
        (ordersStatus) => {
          // Kiểm tra trạng thái đơn hàng
          if (this.ebookId) {
            const completeOrderExists = ordersStatus.some(status => status.ebook_id === this.ebookId && status.status === 'COMPLETE');

            if (completeOrderExists) {
              this.isDocumentVisible = !this.isDocumentVisible;
              // Ẩn hoặc hiện các phần tử khác trong giao diện
              if (this.isDocumentVisible) {
                this.isAudioVisible = false; // Ẩn phần audio khi hiển thị tài liệu
                document.querySelector('.container')?.classList.add('hidden');
                document.querySelector('.document')?.classList.remove('hidden');
              } else {
                document.querySelector('.container')?.classList.remove('hidden');
                document.querySelector('.document')?.classList.add('hidden');
              }
            } else {
              const processingOrderExists = ordersStatus.some(status => status.ebook_id === this.ebookId && status.status === 'PROCESSING');
              if (processingOrderExists) {
                alert('Đơn hàng của bạn đang xử lý. Bạn không thể đọc sách ngay bây giờ.');
              } else {
                alert('Bạn chưa mua sách này hoặc trạng thái đơn hàng không xác định.');
              }
            }
          } else {
            alert('Thông tin sách không hợp lệ.');
          }
        },
        (error) => {
          console.error('Error fetching orders status:', error);
          alert('Đã xảy ra lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại sau.');
        }
      );
    }).catch((error) => {
      console.error('Error during role check:', error);
      alert('Đã xảy ra lỗi khi kiểm tra vai trò người dùng. Vui lòng thử lại sau.');
    });
  }


  // toggleAudioVisibility(): void {
  //   // Kiểm tra xem sách có miễn phí hay không
  //   if (this.ebook?.price === 0) {
  //     this.isAudioVisible = !this.isAudioVisible;
  //     return;
  //   }

  //   // Kiểm tra xem người dùng đã đăng nhập hay chưa
  //   if (this.ebook?.price !== 0 && !this.token.getUserId()) {
  //     this.isPlaying = false;
  //     alert('Bạn cần đăng nhập để nghe sách.');
  //     return;
  //   }

  //   // Lấy danh sách trạng thái đơn hàng
  //   this.orderService.getAllOrdersStatus().subscribe(
  //     (ordersStatus) => {
  //       // Kiểm tra trạng thái đơn hàng
  //       if (this.ebookId) {
  //         const orderStatus = ordersStatus.find(status => status.ebook_id === this.ebookId);

  //         if (orderStatus) {
  //           if (orderStatus.status === 'COMPLETE') {
  //             this.isAudioVisible = !this.isAudioVisible;
  //           } else if (orderStatus.status === 'PROCESSING') {
  //             alert('Đơn hàng của bạn đang xử lý. Bạn không thể nghe sách ngay bây giờ.');
  //           } else {
  //             alert('Trạng thái đơn hàng không xác định.');
  //           }
  //         } else {
  //           alert('Bạn chưa mua sách này.');
  //         }
  //       } else {
  //         alert('Thông tin sách không hợp lệ.');
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching orders status:', error);
  //       alert('Đã xảy ra lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại sau.');
  //     }
  //   );
  // }

  // toggleAudioVisibility(): void {


  //   if (this.userResponse?.role.name === 'admin') {
  //     // Nếu là admin, luôn luôn cho phép xem audio
  //     this.isAudioVisible = true;
  //     return;
  //   }

  //   // Kiểm tra xem sách có miễn phí hay không
  //   if (this.ebook?.price === 0) {
  //     this.isAudioVisible = !this.isAudioVisible;
  //     return;
  //   }

  //   // Kiểm tra xem người dùng đã đăng nhập hay chưa
  //   if (this.ebook?.price !== 0 && !this.token.getUserId()) {
  //     this.isPlaying = false;
  //     alert('Bạn cần đăng nhập để nghe sách.');
  //     return;
  //   }

  //   // Lấy danh sách trạng thái đơn hàng
  //   this.orderService.getAllOrdersStatus().subscribe(
  //     (ordersStatus) => {
  //       // Kiểm tra trạng thái đơn hàng
  //       if (this.ebookId) {
  //         const completeOrderExists = ordersStatus.some(status => status.ebook_id === this.ebookId && status.status === 'COMPLETE');

  //         if (completeOrderExists) {
  //           this.isAudioVisible = !this.isAudioVisible;
  //         } else {
  //           const processingOrderExists = ordersStatus.some(status => status.ebook_id === this.ebookId && status.status === 'PROCESSING');
  //           if (processingOrderExists) {
  //             alert('Đơn hàng của bạn đang xử lý. Bạn không thể nghe sách ngay bây giờ.');
  //           }
  //           else {
  //             alert('Bạn chưa mua sách này hoặc trạng thái đơn hàng không xác định.');
  //           }
  //         }
  //       } else {
  //         alert('Thông tin sách không hợp lệ.');
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching orders status:', error);
  //       alert('Đã xảy ra lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại sau.');
  //     }
  //   );
  // }
  // private userRole: string = ''; 
  // checkRole(): void {
  //   this.tokensv = this.token.getToken();
  //   this.userService.getUserDetail(this.tokensv).subscribe({
  //     next: (response: any) => {
  //       this.userResponse = {
  //         ...response,
  //         date_of_birth: new Date(response.date_of_birth),
  //       }; 
  //       this.userRole = this.userResponse?.role.name || '';  
  //       // alert(`User role: ${this.userRole}`); // Hiển thị vai trò người dùng để kiểm tra
  //     },
  //     error: (error) => {
  //       console.error('Error fetching user details:', error);
  //     }
  //   });
  // }
  private userRole: string = '';
  checkRole(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.tokensv = this.token.getToken();
      this.userService.getUserDetail(this.tokensv).subscribe({
        next: (response: any) => {
          this.userResponse = {
            ...response,
            date_of_birth: new Date(response.date_of_birth),
          };
          this.userRole = this.userResponse?.role.name || '';  // Lưu vai trò người dùng vào biến thành viên
          // alert(`User role: ${this.userRole}`); // Hiển thị vai trò người dùng để kiểm tra
          resolve();
        },
        error: (error) => {
          console.error('Error fetching user details:', error);
          reject(error);
        }
      });
    });
  }
  // checkBuyEbook() {
  //   // Lấy danh sách trạng thái đơn hàng
  //   this.orderService.getAllOrdersStatus().subscribe(
  //     (ordersStatus) => {
  //       // Kiểm tra trạng thái đơn hàng
  //       if (this.ebookId) {
  //         const completeOrderExists = ordersStatus.some(status => status.ebook_id === this.ebookId && status.status === 'COMPLETE');
  //         if (completeOrderExists) {
  //           return true;
  //         }
  //       }
  //     })
  // }
  checkBuyEbook() {
    this.orderService.getAllOrdersStatus().subscribe(
      (ordersStatus) => {
        if (this.ebookId) {
          this.isComplete = ordersStatus.some(status => status.ebook_id === this.ebookId && status.status === 'COMPLETE');
        }
      },
      (error) => {
        console.error('Error fetching order status', error);
      }
    );
  }

  toggleAudioVisibility(): void {
    // Kiểm tra xem sách có miễn phí hay không
    if (this.ebook?.price === 0) {
      if (this.ebook.ebook_mp3s.length === 0) {
        alert('Ebook không có âm thanh')
      }
      this.isAudioVisible = !this.isAudioVisible;

      return;
    }
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    if (!this.token.getUserId()) {
      this.isPlaying = false;
      alert('Bạn cần đăng nhập để nghe sách.');
      return;
    }
    this.checkRole().then(() => {
      // Kiểm tra xem người dùng có phải là admin hay không
      if (this.userRole === 'admin') {
        // Nếu là admin, luôn luôn cho phép xem audio
        this.isAudioVisible = !this.isAudioVisible;
        return;
      }
      // Lấy danh sách trạng thái đơn hàng
      this.orderService.getAllOrdersStatus().subscribe(
        (ordersStatus) => {
          // Kiểm tra trạng thái đơn hàng
          if (this.ebookId) {
            const completeOrderExists = ordersStatus.some(status => status.ebook_id === this.ebookId && status.status === 'COMPLETE');

            if (completeOrderExists) {
              this.isAudioVisible = !this.isAudioVisible;
            } else {
              const processingOrderExists = ordersStatus.some(status => status.ebook_id === this.ebookId && status.status === 'PROCESSING');
              if (processingOrderExists) {
                alert('Đơn hàng của bạn đang xử lý. Bạn không thể nghe sách ngay bây giờ.');
              } else {
                alert('Bạn chưa mua sách này hoặc trạng thái đơn hàng không xác định.');
              }
            }
          } else {
            alert('Thông tin sách không hợp lệ.');
          }
        },
        (error) => {
          console.error('Error fetching orders status:', error);
          alert('Đã xảy ra lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại sau.');
        }
      );
    }).catch((error) => {
      console.error('Error during role check:', error);
      alert('Đã xảy ra lỗi khi kiểm tra vai trò người dùng. Vui lòng thử lại sau.');
    });
  }


  // toggleAudioVisibility(): void {
  //   this.checkRole();

  //   if (this.userRole === 'admin') {

  //     this.isAudioVisible = !this.isAudioVisible;
  //     return;
  //   }

  //   if (this.ebook?.price === 0) {
  //     this.isAudioVisible = !this.isAudioVisible;
  //     return;
  //   }


  //   if (!this.token.getUserId()) {
  //     this.isPlaying = false;
  //     alert('Bạn cần đăng nhập để nghe sách.');
  //     return;
  //   }


  //   this.orderService.getAllOrdersStatus().subscribe(
  //     (ordersStatus) => {

  //       if (this.ebookId) {
  //         const completeOrderExists = ordersStatus.some(status => status.ebook_id === this.ebookId && status.status === 'COMPLETE');

  //         if (completeOrderExists || this.userResponse?.role.name == 'admin') {
  //           this.isAudioVisible = !this.isAudioVisible;
  //         } else {
  //           const processingOrderExists = ordersStatus.some(status => status.ebook_id === this.ebookId && status.status === 'PROCESSING');
  //           if (processingOrderExists) {
  //             alert('Đơn hàng của bạn đang xử lý. Bạn không thể nghe sách ngay bây giờ.');
  //           } else {
  //             alert('Bạn chưa mua sách này hoặc trạng thái đơn hàng không xác định.');
  //           }
  //         }
  //       } else {
  //         alert('Thông tin sách không hợp lệ.');
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching orders status:', error);
  //       alert('Đã xảy ra lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại sau.');
  //     }
  //   );
  // }


  onPlay() {

    this.isPlaying = true;

  }

  onPause() {
    this.isPlaying = false;
  }

  playAudio() {
    if (this.ebook?.price != 0 && !this.token.getUserId()) {
      alert('Bạn cần đăng nhập để nghe sách.');
      return;
    }
    this.isPlaying = true;
    setTimeout(() => {
      const audio: HTMLAudioElement | null = document.querySelector('audio');
      if (audio) {
        audio.play();
      }
    });
  }

  getCurrentThumbnail(): string {
    return this.ebook?.ebook_images[this.currentImageIndex]?.image_url || '';
  }


  formatPrice(price: number | undefined): string {

    if (price === undefined) {
      return 'N/A'; // hoặc giá trị mặc định khác bạn muốn hiển thị
    }
    if (price === 0) {
      return 'Miễn Phí';
    }
    return price.toLocaleString('vi-VN') + ' đ';
  }

  addToLove(ebook: Ebook, event: Event): void {
    this.isPressedAddToLove = true;

    if (!this.token.getUserId()) {
      alert('Bạn cần đăng nhập để thêm yêu thích.');
      this.router.navigate(['/login']);
    } else if (ebook) {
      const maxCartSize = 15;

      if (this.loveService.getLove().size >= maxCartSize) {
        alert('Yêu thích của bạn đã đầy. Vui lòng xóa sản phẩm để thêm');
        event.stopPropagation(); // Ngăn việc click vào ebook-item
      } else if (this.loveService.isProductInLove(ebook.id)) {
        alert('Sản phẩm đã tồn tại trong yêu thích của bạn.');
        event.stopPropagation(); // Ngăn việc click vào ebook-item
      } else {
        this.loveService.addToLove(ebook.id, this.quantity);
        alert('Thêm vào yêu thích thành công.');
        event.stopPropagation(); // Ngăn việc click vào ebook-item
      }
    } else {
      console.error('Không thể thêm sản phẩm vào giỏ hàng vì ebook là null.');
      event.stopPropagation(); // Ngăn việc click vào ebook-item
    }
  }


}
