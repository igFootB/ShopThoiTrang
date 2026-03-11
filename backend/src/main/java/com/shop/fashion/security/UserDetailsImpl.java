package com.shop.fashion.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.shop.fashion.entity.NguoiDung;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

@Getter
public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String ten;
    private String email;

    @JsonIgnore
    private String matKhau;

    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String ten, String email, String matKhau,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.ten = ten;
        this.email = email;
        this.matKhau = matKhau;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(NguoiDung nguoiDung) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(nguoiDung.getQuyen().getTenQuyen()));

        return new UserDetailsImpl(
                nguoiDung.getId(),
                nguoiDung.getTen(),
                nguoiDung.getEmail(),
                nguoiDung.getMatKhau(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return matKhau;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
